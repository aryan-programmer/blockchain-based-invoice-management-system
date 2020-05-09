import util from "util";
import WebSocket from "ws";
import {Block, BlockChain} from "../BlockChain";
import freeze from "../freeze";

@freeze
export default class P2PServer {
	public readonly sockets: WebSocket[];
	public readonly chain: BlockChain;

	constructor (chain: BlockChain) {
		this.chain = chain;
		this.sockets = [];
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
		socket.send(JSON.stringify(this.chain.chain));
	}

	private addMessageHandlerFor (socket: WebSocket) {
		socket.on("message", (message: string | Buffer | ArrayBuffer | Buffer[]) => {
			if (typeof message === "string") {
				const data: Block[] = JSON.parse(message).map(
					(value: Block) =>
						new Block(value.timestamp, value.lastHash, value.hash, value.data)
				);
				if(this.chain.replaceChain(data)){
					console.log("Replaced chain with: ", util.inspect(data, true, null, true));
				}
			}
		});
	}
}
