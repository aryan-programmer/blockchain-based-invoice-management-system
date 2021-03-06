import WebSocket from "ws";
import {Block, BlockChain} from "../BlockChain";
import {freezeClass} from "../freeze";
import {Invoice, InvoicePool} from "../Wallet";

enum SentDataType {
	Chain,
	Invoice,
	InitInvoicePool,
	ClearInvoicePool,
}

type SentDataValue = [Block[], Invoice, Invoice[], never];

type SentData_Maker<T extends SentDataType> = {
	type: T;
	value: SentDataValue[T]
};
type SentData =
	SentData_Maker<SentDataType.Chain> |
	SentData_Maker<SentDataType.Invoice> |
	SentData_Maker<SentDataType.InitInvoicePool> |
	SentData_Maker<SentDataType.ClearInvoicePool> |
	never;

@freezeClass
export default class P2PServer {
	private static clearInvoicesMessage  = JSON.stringify({type: SentDataType.ClearInvoicePool});
	public readonly sockets: WebSocket[] = [];

	constructor (
		public readonly chain: BlockChain,
		public readonly pool: InvoicePool,
	) {
		Object.freeze(this);
	}

	private static sendInvoiceTo (socket: WebSocket, invoice: Invoice) {
		socket.send(JSON.stringify({
			type: SentDataType.Invoice,
			value: invoice
		}));
	}

	private static sendClearInvoicesTo (socket: WebSocket) {
		socket.send(P2PServer.clearInvoicesMessage);
	}

	listen (p2pPort: number, peers: string[]) {
		const server = new WebSocket.Server({port: p2pPort});
		server.on("connection", socket => this.connectSocket(socket));
		this.connectToPeers(peers);
		console.log(`Listening for P2P connections on port ${p2pPort}`);
	}

	syncChains () {
		for (const socket of this.sockets) {
			this.sendChainTo(socket)
		}
	}

	broadcastInvoice (invoice: Invoice) {
		for (const socket of this.sockets) {
			P2PServer.sendInvoiceTo(socket, invoice);
		}
	}

	broadcastClearInvoices () {
		for (const socket of this.sockets) {
			P2PServer.sendClearInvoicesTo(socket);
		}
	}

	private connectToPeers (peers: string[]) {
		for (const peer of peers) {
			const socket = new WebSocket(peer);
			socket.on("open", () =>
				this.connectSocket(socket)
			)
		}
	}

	private connectSocket (socket: WebSocket) {
		this.sockets.push(socket);
		console.log(`Connected to socket`);
		this.addMessageHandlerFor(socket);
		this.sendChainTo(socket);
		this.sendInvoicesTo(socket);
	}

	private addMessageHandlerFor (socket: WebSocket) {
		socket.on("message", (message: string | Buffer | ArrayBuffer | Buffer[]) => {
			if (typeof message === "string") {
				const msg: SentData       = JSON.parse(message);
				let relayToPeers: boolean = false;
				if (msg.type === SentDataType.Chain) {
					const data: Block[] = msg.value.map(
						(value: Block) =>
							new Block(value.timestamp, value.lastHash, value.hash, value.data, value.nonce, value.difficulty)
					);
					relayToPeers        = this.chain.replaceChain(data);
				} else if (msg.type === SentDataType.Invoice) {
					relayToPeers = this.pool.addInvoice(new Invoice(msg.value, true));
				} else if (msg.type === SentDataType.InitInvoicePool) {
					if (this.pool.invoices.length === 0) {
						const data: Invoice[] = msg.value.map(
							(value: Invoice) =>
								new Invoice(value, true)
						);
						this.pool.invoices    = data;
						relayToPeers          = true;
					}
				} else if (msg.type === SentDataType.ClearInvoicePool) {
					if (this.pool.invoices.length !== 0) {
						this.pool.clear();
						relayToPeers = true;
					}
				}
				if (relayToPeers) {
					for (const socket_ of this.sockets) {
						if (socket === socket_) continue;
						socket_.send(message);
					}
				}
			}
		});
	}

	// region ...Send to socket
	private sendChainTo (socket: WebSocket) {
		socket.send(JSON.stringify({
			type: SentDataType.Chain,
			value: this.chain.chain
		}));
	}

	private sendInvoicesTo (socket: WebSocket) {
		socket.send(JSON.stringify({
			type: SentDataType.InitInvoicePool,
			value: this.pool.invoices
		}));
	}

	// endregion Send to socket
}
