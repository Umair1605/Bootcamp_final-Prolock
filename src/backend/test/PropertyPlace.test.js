const { expect } = require("chai"); 

    const toWei = (num) => ethers.utils.parseEther(num.toString());
    const fromWei = (num) => ethers.utils.formatEther(num);

    let PropertyPlace;
    let propertyplace
    let deployer;
    let addr1;
    let addr2;
    let addr3;
    let addrs;
    let URI = "sample URI"

    beforeEach(async function () {
        // Get the ContractFactories and Signers here.
        PropertyPlace = await ethers.getContractFactory("PropertyPlace");
        [deployer, addr1, addr2, addr3,...addrs] = await ethers.getSigners();

        propertyplace = await PropertyPlace.deploy()
    });

    describe("Deployment", function () {
        it("Should check the owner of Contract", async function () {
            expect(await propertyplace.owner()).to.equal(deployer.address);
        });
    });

    describe("Register Property",  () => {
        it("Should track each property", async() => {
            //addr1 register property
            await propertyplace.connect(addr1).registerProperty(URI,2)
            expect(await propertyplace.balanceOf(addr1.address)).to.equal(1);
            expect(await propertyplace.tokenURI(1)).to.equal(URI);
            expect(await propertyplace.ownerOf(1)).to.equal(addr1.address);
            // addr2 register property
            await propertyplace.connect(addr2).registerProperty(URI,2)
            expect(await propertyplace.balanceOf(addr2.address)).to.equal(1);
            expect(await propertyplace.tokenURI(2)).to.equal(URI);
            expect(await propertyplace.ownerOf(2)).to.equal(addr2.address);
        });
        it("Should check Property Data",async() => {
            let price=2;
            const tx = await propertyplace.connect(addr1).registerProperty(URI,price);
			const rc = await tx.wait(); // 0ms, as tx is already confirmed
			const event = rc.events.find(event => event.event === 'Offered');
            const property = await propertyplace.properties(1);
            expect(property.tokenId).to.equal(1);
            expect(property.price).to.equal(2);
            expect(property.creator).to.equal(addr1.address);
            expect(property.sold).to.equal(false);
        })
        it("Should fail if price is set to zero", async() =>  {
            await expect(
                propertyplace.connect(addr1).registerProperty(URI,0)
            ).to.be.revertedWith("InvalidPrice");
        });
    });

    describe("Purchase Property" , async() => {
        let price;
        let sellerBal,buyerBal;

        beforeEach(async function () {
            // addr1 register property
            price = toWei(2);
            await propertyplace.connect(addr1).registerProperty(URI,price);
            sellerBal = await addr1.getBalance()
            buyerBal = await addr2.getBalance()
        })
        it("Should transfer the owner and property is sold" , async() => {
            const tx = await propertyplace.connect(addr2).purchaseProperty(1, {value: price});
			const rc = await tx.wait(); // 0ms, as tx is already confirmed
			const event = rc.events.find(event => event.event === 'Bought');
            const property = await propertyplace.properties(1);
            const owner = await propertyplace.ownerOf(1);
            //property is sold
            expect(property.sold).to.equal(true);
            // The buyer should now own the nft
            expect(owner).to.equal(addr2.address);
        })
        it("Should fail if tokenID is invalid", async() =>  {
            await expect( propertyplace.connect(addr2).purchaseProperty(3, {value: price})).to.be.revertedWith("InvalidId");
        });
        it("Should fail if owner is buyer", async() =>  {
            await expect( propertyplace.connect(addr1).purchaseProperty(1, {value: price})).to.be.revertedWith("UnauthorizedBuyer");
        });
        it("Should fail if value is not equal to price", async() =>  {
            await expect( propertyplace.connect(addr2).purchaseProperty(1, {value: toWei(1)})).to.be.revertedWith("InsufficientBalance");
        });
        it("Should fail if property is not on sale", async() =>  {
            await propertyplace.connect(addr2).purchaseProperty(1, {value: price});
            await expect( propertyplace.connect(addr3).purchaseProperty(1, {value: price})).to.be.revertedWith("NotOnSale");
        });
    })
    describe("Put On Sale" , async() => {
        let price;

        beforeEach(async function () {
            // addr1 register property
            price = toWei(2);
            await propertyplace.connect(addr1).registerProperty(URI,price);
            await propertyplace.connect(addr2).purchaseProperty(1, {value: price});
        })
        it("Should update the properties Info" , async() => {
            const tx = await propertyplace.connect(addr2).putOnSale(1, 3);
			const rc = await tx.wait(); // 0ms, as tx is already confirmed
			const event = rc.events.find(event => event.event === 'Bought');
            const property = await propertyplace.properties(1);
            expect(property.sold).to.equal(false);
            expect(property.price).to.equal(3);
        })
    })