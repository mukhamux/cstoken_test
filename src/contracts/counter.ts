import {Address, beginCell, Cell, type Contract, contractAddress, type ContractProvider, type Sender, SendMode} from '@ton/core';

export type CounterConfig = {
    initialCounterValue: number
};

export function counterConfigToCell(config: CounterConfig): Cell {
    return beginCell().storeUint(config.initialCounterValue, 64).endCell();
}

export class Counter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new Counter(address);
    }

    static createFromConfig(config: CounterConfig, code: Cell, workchain = 0) {
        const data = counterConfigToCell(config);
        const init = {code, data};
        return new Counter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const {stack} = await provider.get("counter", []);
        return stack.readBigNumber();
    }

    async sendIncrement(provider: ContractProvider, via: Sender) {
        const messageBody = beginCell()
            .storeUint(1, 32)
            // .storeUint(0, 64)
            .endCell()
        await provider.internal(via, {value: "0.002", body: messageBody})
    }
}
