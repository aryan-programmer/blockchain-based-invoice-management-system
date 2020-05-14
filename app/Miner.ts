import {Block} from "../BlockChain";
import {freezeClass} from "../freeze";
import {deepFreeze} from "../utils";
import {Wallet} from "../Wallet";
import P2PServer from "./P2PServer";

@freezeClass
export class Miner {
	constructor (
		public readonly wallet: Wallet,
		public readonly p2p: P2PServer,
	) {
	}

	mine (): Block | null {
		if (this.p2p.pool.invoices.length === 0) return null;
		const ret = this.p2p.chain.addBlock(deepFreeze(this.p2p.pool.getValidInvoices()));
		this.p2p.syncChains();
		this.p2p.pool.clear();
		this.p2p.broadcastClearInvoices();
		return ret;
	}
}
