// Difficulty : hard / very hard
// Last round before we find the real person behind it !

// We have to find -> osint4target

// osint4target is funded via bronance. He received a lot of huge txes

// Adress did multiple very sucessful rugpulls
// For some reason, some guy always bought his tokens

// for i numbers of times
// you can deploy an erc20 with the deployerc() function
// addliquidity will add liquidity
// The "someguy" wallet buys the erc20
// adress leaves with the money

// All accounts addr and pk are saved in addresses/osint4/


const { ethers } = require('hardhat');

const OSINT4_TRANSCRIPTS_PATH = 'transcripts/osint4/';
const OSINT4_ADDRESSES_PATH = 'addresses/osint4/';
const NUM_RUGPULLS = 7;

let wmel_contract = 0;
let wmel_balance_contract = 0;
let kwike_factory_contract = 0;
let kwike_router_contract = 0;

async function checkAddressFromFile(contractName) {
    const filePath = `./addresses/${contractName}.txt`;

    if (fs.existsSync(filePath)) {
        const address = fs.readFileSync(filePath, 'utf8');
        console.info(`[+] ${contractName} found @ ${address}`);
        return address;
    }

    return null;
}

async function depositAs(as, percent) {
    let user_balance = await ethers.provider.getBalance(as.address)


    let val = getPercentageOfBigNumber(user_balance, percent);

    console.log("[ERC20] User", as.address, "depositing", percent, "% of wallet (", weiToEther(val), ") in WMEL")


    let overrides = {
        value: val
    };

    // Deposit BNB to have WBNB
    res = await wmel_contract.connect(as).deposit(overrides);

    return res;
}


async function createPairAndLiquidity(as, on) {
    /*
     * Create pair on KwikESwap and get the pair address
     */
    // console.log('[+] Creating pair on KwikESwap')
    try {
        res = await kwike_factory_contract.connect(as).createPair(wmel_contract.address, on.address);
    }
    catch (error) {
        // the pair might exist bc it creates itself in constructor ?
        ;
    }

    pair_addr = await kwike_factory_contract.getaPair(wmel_contract.address, on.address)

    /*
     * Attach to pair
     */
    const KwikEPair = await ethers.getContractFactory("KwikEPair");
    KwikEPairContract = KwikEPair.attach(pair_addr);

    console.log(wmel_contract.address,
        on.address,
        ethers.utils.parseUnits("5.0", 18), ethers.utils.parseUnits("1000000", 18), ethers.utils.parseUnits("2", 18), ethers.utils.parseUnits("1000000", 18),
        on.address,
        Math.floor(Date.now() / 1000) + 60 * 10);

    let liq_add = await kwike_router_contract.connect(as).addLiquidity(
        wmel_contract.address,
        on.address,
        ethers.utils.parseUnits("20.0", 18), ethers.utils.parseUnits("10000", 18), ethers.utils.parseUnits("20", 18), ethers.utils.parseUnits("10000", 18),
        on.address,
        Math.floor(Date.now() / 1000) + 60 * 10);

    await liq_add.wait();

}

const deployAs = async (contract_name, as, parameters = []) => {

    let contractFactory = await ethers.getContractFactory(contract_name);
    let contract = await contractFactory.connect(as).deploy(...parameters);
    await contract.deployed()

    return contract;
}

function weiToEther(gwei) {
    const gweiAsBigNumber = ethers.utils.parseUnits(gwei.toString(), 'wei'); // Converts gwei to wei
    const ether = ethers.utils.formatUnits(gweiAsBigNumber, 'ether'); // Converts wei to ether

    return ether;
}

async function approveRouterWrapped(as) {

    let res = await wmel_contract.connect(as).approve(kwike_router_contract.address, ethers.utils.parseEther("20.0"));


    return res;

}

async function approveRouterERC(as, on) {

    // let contractFactory = await ethers.getContractFactory("ERC20");

    // contractFactory = contractFactory.connect(as);

    // let user_ctx = contractFactory.attach(on);

    // console.log("OK attach")

    // console.log("kwike_router_contract.address", kwike_router_contract.address)

    // let res = await user_ctx.approve(kwike_router_contract.address, ethers.utils.parseEther("10000"));
    // console.log("OK res")
    // console.log("Trying to connect to", on, 'as', as)
    let user_ctx = await ethers.getContractAt("ERC20", on, as);

    let res = await user_ctx.connect(as).approve(kwike_router_contract.address, ethers.utils.parseEther("10000"));
    return res;
}

async function do_a_swap(as, amount_in, slipp, path) {
    //         IPancakeRouter02(PANCAKESWAP_ROUTER).swapExactTokensForTokensSupportingFeeOnTransferTokens(_amountIn, minAmountWithSlippage, path, address(this), block.timestamp);

    let min_tokens = await kwike_router_contract.getAmountsOut(amount_in, path);


    let slippage = ethers.BigNumber.from(slipp).mul(100);
    let val1 = min_tokens[1];
    let min_slippage = val1.mul(slippage).div(ethers.BigNumber.from(10000))

    try {
        let res = await kwike_router_contract.connect(as).swapExactTokensForTokensSupportingFeeOnTransferTokens(amount_in, min_slippage, [path[0], path[1]], as.address, Math.floor(Date.now() / 1000) + 60 * 10);
        await res.wait();
    } catch (error) {
        console.log("ERROR ON SWAP", error);
        return;
    }

    return res;
}

async function depositAs(as) {


    let user_balance = await ethers.provider.getBalance(as.address)

    let user_percent = 5 + Math.floor(Math.random() * 45) // 5 - 50%

    let val = getPercentageOfBigNumber(user_balance, user_percent);

    console.log("[ERC20] User", as.address, "depositing", user_percent, "% of wallet (", weiToEther(val), ") in WMEL")


    let overrides = {
        value: val
    };

    // Deposit BNB to have WBNB
    res = await wmel_contract.connect(as).deposit(overrides);

    return res;
}

async function deployOrAttach(contractName, args = []) {
    const contractFactory = await ethers.getContractFactory(contractName);
    const address = await checkAddressFromFile(contractName);

    if (address) {
        return contractFactory.attach(address);
    }

    const contract = await contractFactory.deploy(...args);
    await contract.deployed();

    fs.writeFileSync(`./addresses/${contractName}.txt`, contract.address, 'utf8');
    console.info(`[+] ${contractName} deployed @ ${contract.address}`);

    return contract;
}

async function deployAll() {
    console.log("[+] Deploying contracts !");

    wmel_contract = await deployOrAttach("WMEL");
    kwike_factory_contract = await deployOrAttach("KwikEFactory", [0x0]);
    kwike_router_contract = await deployOrAttach("KwikERouter", [kwike_factory_contract.address, wmel_contract.address]);
    token_contract = await deployOrAttach("ERC20");

}

function getPercentageOfBigNumber(bigNumber, floatPercentage) {
    if (!(bigNumber instanceof ethers.BigNumber) || typeof floatPercentage !== 'number') {
        throw new Error('Invalid input: first parameter must be a BigNumber and second parameter must be a number');
    }

    // Ensure the float percentage is within range (0 <= floatPercentage <= 100)
    if (floatPercentage < 0 || floatPercentage > 100) {
        throw new Error('Invalid input: float percentage must be between 0 and 100');
    }

    // Calculate the percentage
    const scaleFactor = ethers.BigNumber.from(10).pow(18); // 1 ether
    const percentage = ethers.BigNumber.from(Math.round(floatPercentage * 1e4)).mul(scaleFactor).div(1e4 * 100);
    const result = bigNumber.mul(percentage).div(scaleFactor);

    return result;
}

async function withdraw_as(as, percent)
{
    let user_balance = await wmel_contract.getBalance(as.address);

    let val = getPercentageOfBigNumber(user_balance, percent);

    let res = await wmel_contract.connect(as).withdraw(val);
}

async function printBalsFor(wallet)
{
    let wmel_bal = await wmel_contract.balanceOf(wallet.address);
    let mel_bal = await ethers.provider.getBalance(wallet.address);

    console.log("WMEL : ", weiToEther(wmel_bal), "\nMEL : ", weiToEther(mel_bal));


}

async function main() {
    const [deployer] = await ethers.getSigners();

    await deployAll();

    // Read the bronance wallet address and private key
    const bronanceAddress = fs.readFileSync(`addresses/bronance_osint.address`, 'utf-8').trim();
    const bronancePrivateKey = fs.readFileSync(`addresses/bronance_osint.key`, 'utf-8').trim();
    const bronanceWallet = new ethers.Wallet(bronancePrivateKey);
    const bronanceSigner = bronanceWallet.connect(ethers.provider);




    const osint4targetWallet = ethers.Wallet.createRandom();
    fs.writeFileSync(`${OSINT4_ADDRESSES_PATH}osint4target.address`, osint4targetWallet.address);
    fs.writeFileSync(`${OSINT4_ADDRESSES_PATH}osint4target.key`, osint4targetWallet.privateKey);
    const osint4targetSigner = osint4targetWallet.connect(ethers.provider);

    // Generate "someguy" address (Target for osint 3)
    const osint3targetWallet = ethers.Wallet.createRandom();
    fs.writeFileSync(`${OSINT4_ADDRESSES_PATH}osint3target.address`, osint3targetWallet.address);
    fs.writeFileSync(`${OSINT4_ADDRESSES_PATH}osint3target.key`, osint3targetWallet.privateKey);
    const osint3targetSigner = osint3targetWallet.connect(ethers.provider);

    console.log("Deploy start balances : \n");
    console.log("O4 target :")
    await printBalsFor(osint4targetSigner);
    console.log("O3 target : ")
    await printBalsFor(osint3targetSigner);


    // Initial funding (last step)
    for (let i = 0; i < 1; ++i) {
        // Fund "osint4 target" address with MEL from bronance
        // At this point OSINT is done since we can identify the person.
        const tx1 = await bronanceSigner.sendTransaction({
            to: osint4targetSigner.address,
            value: ethers.utils.parseEther('40000'),
        });

        const receipt1 = await tx1.wait();
        console.log("Receipt ", i, "OK !")
        fs.writeFileSync(`${OSINT4_TRANSCRIPTS_PATH}bronance_to_osint4target${i}.receipt`, JSON.stringify(receipt1));

        // let t_amount = (1000 * 60) * (2 + Math.floor(Math.random() * 5))

    }

    // Fund "someguy" address with MEL from bronance
    const tx2 = await bronanceSigner.sendTransaction({
        to: osint3targetWallet.address,
        value: ethers.utils.parseEther('100'),
    });

    const receipt1 = await tx2.wait();
    fs.writeFileSync(`${OSINT4_TRANSCRIPTS_PATH}bronance_to_osint3target.receipt`, JSON.stringify(receipt1));

    console.log("Rugpulling !");
    // Perform rugpulls
    for (let i = 0; i < NUM_RUGPULLS; i++) 
    {
        let t4bal = await wmel_contract.balanceOf(osint4targetSigner.address);
        let t3bal = await wmel_contract.balanceOf(osint3targetSigner.address);

        console.log('Iteration', i, "signer 4 ", weiToEther(t4bal), "signer 3", weiToEther(t3bal));
        // Deploy ERC20
        const erc20 = await deployAs("ERC20", osint4targetSigner);

        await approveRouterWrapped(osint4targetSigner);

        await depositAs(osint4targetSigner, 90);

        // Add liquidity
        await createPairAndLiquidity(osint4targetSigner, erc20);

        let cbalance = await ethers.provider.getBalance(osint3targetSigner.address);
        let to_deposit = getPercentageOfBigNumber(cbalance, 90)

        let overrides = {
            value: to_deposit
        };


        let dep = await wmel_contract.connect(osint3targetSigner).deposit(overrides)

        await dep.wait();

        let sg_b = await wmel_contract.balanceOf(osint3targetSigner.address);


        let prom = await approveRouterWrapped(osint3targetSigner);
        await prom.wait();

        // Someguy buys the ERC20
        let tx0 = await do_a_swap(osint3targetSigner, getPercentageOfBigNumber(sg_b, 80), 80, [wmel_contract.address, erc20.address]);

        let txr = await tx0.wait()

        sg_b = await wmel_contract.balanceOf(osint3targetSigner.address);


        console.log("SWAP 1 OK !");

        // massive buy 
        let tx1 = await do_a_swap(osint4targetSigner, ethers.utils.parseEther('1000'), 80, [wmel_contract.address, erc20.address])
        txr = await tx1.wait();

        let sg_t_b = await erc20.getBalanceOf(osint3targetSigner.address);
        let sg_t_b1 = await erc20.getBalanceOf(osint4targetSigner.address);

        const swapReceipt = await do_a_swap(osint3targetSigner, sg_t_b, 99, [erc20.address, wmel_contract.address]);

        // Assume your doSwap function returns a receipt
        fs.writeFileSync(`${OSINT4_TRANSCRIPTS_PATH}someguy_buy_erc20_${i}.receipt`, JSON.stringify(swapReceipt));

        // Save transactions and addresses (ERC20 and swap)
        fs.writeFileSync(`${OSINT4_ADDRESSES_PATH}erc20_${i}.address`, erc20.address);

    }

    for (let i = 0; i < 5; ++i)
    {
        console.log('Withdraw', i);
        withdraw_as(osint3targetSigner, 20 * i);
    }

    console.log("Deploy start balances : \n");
    console.log("O4 target :")
    await printBalsFor(osint4targetSigner);
    console.log("O3 target : ")
    await printBalsFor(osint3targetSigner);

    console.log('Challenge setup complete');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
