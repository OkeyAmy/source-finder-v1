// hooks/useAccount.ts
import { useConnection } from 'wagmi'
import { signTypedData } from 'viem/actions';
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
// import { signTypedData } from 'viem/wallet'


export function useAccountForPayment() {
//   const { address, connector } = useWagmiAccount()
    const { address, connector } = useConnection();

    const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY || "";

    const client = createWalletClient(sponsorPrivateKey !== "" ? {
        account: privateKeyToAccount(sponsorPrivateKey as `0x${string}`),
        chain: mainnet,
        transport: http(),
    } : ({} as any));
  
    return {
        address,
        signTypedData: async (domain: any, types: any, value: any, primaryType: string) => {
            if (!connector) throw new Error('No wallet connected')
            // Use connector to sign
            // return connector.signTypedData({ domain, types, value })
            return signTypedData(client, {
                account: privateKeyToAccount(sponsorPrivateKey as `0x${string}`),
                domain,
                types,
                message: value,
                primaryType,
            })
        }
    }
}

// const signature = await signTypedData(client, {
//   domain: {
//     name: 'Ether Mail',
//     version: '1',
//     chainId: 1,
//     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
//   },
//   types: {
//     Person: [
//       { name: 'name', type: 'string' },
//       { name: 'wallet', type: 'address' },
//     ],
//     Mail: [
//       { name: 'from', type: 'Person' },
//       { name: 'to', type: 'Person' },
//       { name: 'contents', type: 'string' },
//     ],
//   },
//   primaryType: 'Mail',
//   message: {
//     from: {
//       name: 'Cow',
//       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
//     },
//     to: {
//       name: 'Bob',
//       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
//     },
//     contents: 'Hello, Bob!',
//   },
// })
