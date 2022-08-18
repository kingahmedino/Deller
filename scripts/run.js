const main = async () => {
  const [owner, account1, account2, account3] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory("Marketplace");
  const marketplaceContract = await contractFactory.deploy();
  await marketplaceContract.deployed();
  console.log("Marketplace deployed to:", marketplaceContract.address);
  console.log("Marketplace deployed by:", owner.address);

  //set a price for NFT to be minted
  let price = hre.ethers.utils.parseUnits("10", "ether");
  //tests
  //list three items with three different accounts
  let createItemTxn = await marketplaceContract
    .connect(account1)
    .createToken("https://jsonkeeper.com/b/MHC7", price);
  await createItemTxn.wait();

  price = hre.ethers.utils.parseUnits("103", "ether");
  createItemTxn = await marketplaceContract
    .connect(account2)
    .createToken("https://jsonkeeper.com/b/GQ1U", price);
  await createItemTxn.wait();

  price = hre.ethers.utils.parseUnits("28", "ether");
  createItemTxn = await marketplaceContract
    .connect(account3)
    .createToken("https://jsonkeeper.com/b/TJBF", price);
  await createItemTxn.wait();

  //fetch all items after listing
  let marketItems = await marketplaceContract.fetchMarketItems();
  console.log("Market items: ", marketItems);

  //sell two NFTs to two buyers
  const [_, buyerAddress, anotherBuyerAddress] = await hre.ethers.getSigners();

  let buyPrice = hre.ethers.utils.parseUnits("10", "ether");
  let saleTxn = await marketplaceContract
    .connect(buyerAddress)
    .createMarketSale(1, { value: buyPrice });
  await saleTxn.wait();

  buyPrice = hre.ethers.utils.parseUnits("103", "ether");
  saleTxn = await marketplaceContract
    .connect(anotherBuyerAddress)
    .createMarketSale(2, { value: buyPrice });
  await saleTxn.wait();

  //fetch all items after listing
  marketItems = await marketplaceContract.fetchMarketItems();
  marketItems = await Promise.all(
    marketItems.map(async (i) => {
      const tokenUri = await marketplaceContract.tokenURI(i.tokenId);

      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toNumber(),
        seller: i.seller.toString(),
        owner: i.owner.toString(),
        tokenUri,
        sold: i.sold,
      };
      return item;
    })
  );
  console.log("Market Items: ", marketItems);

  //get a token's URI
  const tokenUri = await marketplaceContract.tokenURI(1);
  console.log("Token URI for item 1: ", tokenUri);

  //get item by Id
  const item = await marketplaceContract.getItemById(1);
  console.log("Item: ", item);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0); // exit Node process without error
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
