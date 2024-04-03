import { Connection, PublicKey, AccountInfo, GetProgramAccountsConfig } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import fs from 'fs';

// Initialize connection
const cluster = "https://api.mainnet-beta.solana.com";
const connection = new Connection(cluster, 'confirmed');

const pairAddress = new PublicKey('AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc');
const raydiumPoolAddress = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

// Function to subscribe to transactions for a specific token mint
const subscribeToTokenTransactions = async () => {
    let last: string | undefined = await fetchRecentTransactionsByTokenAddress(pairAddress.toString());;
    let count = 0;
    console.time(count.toString());
    const subscriptionId = connection.onProgramAccountChange(
        raydiumPoolAddress,
        async (keyedAccountInfo, context) => {
            const data = AccountLayout.decode(keyedAccountInfo.accountInfo.data);
            console.timeEnd(count.toString());
            count++;
            console.time(count.toString());
            // console.log('context');
            // console.log(context);
            // console.log('accountInfo');
            // console.log(keyedAccountInfo);
            //console.log(accountInfo);
            // console.log('info');
            // console.log(data);
            const date = await connection.getBlockTime(context.slot);
            console.log(date ? new Date(date * 1000) : null);
            // Additional logic to handle changes

            last = await fetchRecentTransactionsByTokenAddress(pairAddress.toString(), last);
        },
        'confirmed',
        [{
            memcmp: {
                offset: 0,
                bytes: pairAddress.toBase58(),
            }
        }]
    );

    return subscriptionId;
};

subscribeToTokenTransactions().then((subscriptionId) => {
    console.log(`Subscribed with subscription ID: ${subscriptionId}`);
    // Keep the subscription active or add logic to unsubscribe when done
    // connection.removeProgramAccountChangeListener(subscriptionId);
});


async function fetchRecentTransactionsByTokenAddress(address: string, last?: string) {
    // Convert the token address to a PublicKey
    const addressPublicKey = new PublicKey(address);

    console.log(last);

    connection.onSignatureWithOptions
    // Fetch recent transaction signatures for the token address
    // Note: This example fetches transaction signatures for the token's mint address. Adjust as needed.
    const signatures = await connection.getSignaturesForAddress(addressPublicKey, {
        limit: last ? 1000 : 10, // Limit the number of signatures (transactions) to fetch
        until: last,
    }, 'confirmed');

    const legitSignatures = signatures.filter(sig => !sig.err).map(si => si.signature);

    console.log('-----------------------');
    console.log(signatures.map(sig => sig.signature));
    console.log('-----------------------');

    const transactions = await connection.getTransactions(legitSignatures, { maxSupportedTransactionVersion: 0 });

    console.log('legitSignaturesLength');
    console.log(legitSignatures.length);

    transactions.forEach((transaction) => {
        if(!transaction) {
            return ;
        }

        try {
            const initiatorPublicKey = transaction?.transaction.message.staticAccountKeys[0].toString();
            const balances = {} as any;
            const buyers = {} as any;
            transaction?.meta?.preTokenBalances?.forEach(tokenBalance => {
                if (!tokenBalance.owner) {
                    return;
                }
    
                if (!balances[tokenBalance.owner]) {
                    balances[tokenBalance.owner] = {};
                }
    
                balances[tokenBalance.owner][tokenBalance.mint] = {
                    pre: tokenBalance.uiTokenAmount,
                };
            });
    
            transaction?.meta?.postTokenBalances?.forEach(tokenBalance => {
                if (!tokenBalance.owner) {
                    return;
                }
    
                if (!balances[tokenBalance.owner]) {
                    balances[tokenBalance.owner] = {};
                }
    
                if (!balances[tokenBalance.owner][tokenBalance.mint]) {
                    balances[tokenBalance.owner][tokenBalance.mint] = {
                        post: tokenBalance.uiTokenAmount,
                    };
                } else {
                    balances[tokenBalance.owner][tokenBalance.mint].post = tokenBalance.uiTokenAmount;
                }
    
    
    
                if (tokenBalance.mint === '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3') {
                    const bought = balances[tokenBalance.owner][tokenBalance.mint].post.uiAmount - balances[tokenBalance.owner][tokenBalance.mint]?.pre?.uiAmount ?? 0;
                    
                    if (bought > 0 && tokenBalance.owner === initiatorPublicKey) {
                        buyers[tokenBalance.owner] = {
                            bought,
                            transaction: transaction.transaction.signatures[0],
                        };
                    }
                }
            });

            if (Object.keys(buyers).length) {
                console.log('buyers');
                console.log(Object.keys(buyers));
                fs.writeFileSync(`./log/${transaction.transaction.signatures[0]}.json`, JSON.stringify(transaction, undefined, 2));
                fs.writeFileSync(`./log/buyer_${transaction.transaction.signatures[0]}.json`, JSON.stringify(buyers, undefined, 2));
            }
        } catch (error) {
            console.log(error);
            console.log(JSON.stringify(transaction?.meta, undefined, 2));
        }
        
    });

    return signatures[0].signature;
}