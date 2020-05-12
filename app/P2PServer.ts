import WebSocket from "ws";
import {Block, BlockChain} from "../BlockChain";
import {freezeClass} from "../freeze";
import {Invoice, InvoicePool} from "../Wallet";

enum SentDataType {
	Chain,
	Invoice
}

@freezeClass
export default class P2PServer {
	public readonly sockets: WebSocket[] = [];

	constructor (
		public readonly chain: BlockChain,
		public readonly pool: InvoicePool,
	) {
		Object.freeze(this);
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

	private connectToPeers (peers: string[]) {
		for (const peer of peers) {
			const socket = new WebSocket(peer);
			socket.on("open", () => this.connectSocket(socket))
		}
	}

	private connectSocket (socket: WebSocket) {
		this.sockets.push(socket);
		console.log(`Connected to socket`);
		this.addMessageHandlerFor(socket);
		this.sendChainTo(socket);
	}

	private sendChainTo (socket: WebSocket) {
		socket.send(JSON.stringify({
			type: SentDataType.Chain,
			value: this.chain.chain
		}));
	}

	private static sendInvoiceTo (socket: WebSocket, invoice: Invoice) {
		socket.send(JSON.stringify({
			type: SentDataType.Invoice,
			value: invoice
		}));
	}

	private addMessageHandlerFor (socket: WebSocket) {
		socket.on("message", (message: string | Buffer | ArrayBuffer | Buffer[]) => {
			if (typeof message === "string") {
				const msg:
					{ type: SentDataType.Chain, value: Block[] } |
					{ type: SentDataType.Invoice, value: Invoice } = JSON.parse(message);
				if (msg.type === SentDataType.Chain) {
					const data: Block[] = msg.value.map(
						(value: Block) =>
							new Block(value.timestamp, value.lastHash, value.hash, value.data, value.nonce, value.difficulty)
					);
					this.chain.replaceChain(data);
				} else if (msg.type === SentDataType.Invoice) {
					this.pool.addInvoice(new Invoice(msg.value, true));
				}
			}
		});
	}
}
