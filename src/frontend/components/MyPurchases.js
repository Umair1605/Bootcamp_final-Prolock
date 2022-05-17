import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row,Form, Col, Card,Button } from 'react-bootstrap'

function OnSoldProperties(properties) {
    return (
        <>
            <h2>ON Sale</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {properties.map((property, idx) => (
                <Col key={idx} className="overflow-hidden">
                    <Card>
                        <Card.Img variant="top" src={property.image} />
                        <Card.Body color="secondary">
                            <Card.Title>
                                <b>Address: </b>{property.address}
                            </Card.Title>
                            <Card.Text>
                                <b>Description: </b>{property.description}
                            </Card.Text>
                            <Card.Text>
                                <b>Owner: </b>{property.owner.slice(0, 5) + '...' + property.owner.slice(38,42)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
            </Row>
        </>
    )
}
const MyPurchases = ({ propertyplace, account }) => {

    const [loading, setLoading] = useState(true)
    const [purchases, setPurchases] = useState([])
    const [properties, setProperties] = useState([])
    const [onsold, setOnSold] = useState([])
    const [price, setPrice] = useState(null)

    const loadPurchasedProperties = async () => {
        const propertyCount =  await (propertyplace._tokenIds());
        for (let i = 1; i <= propertyCount; i++) {
            const property = await propertyplace.properties(i)
            const owner = await propertyplace.ownerOf(i)
            if ( owner.toLowerCase()===account && (owner !== property.creator || owner === property.creator)) {
                // get uri url from property contract
                const uri = await propertyplace.tokenURI(property.tokenId)       
                // use uri to fetch the property metadata stored on ipfs 
                const response = await fetch(uri)
                const metadata = await response.json()
                const tokenOwner = await propertyplace.ownerOf(property.tokenId) 
                // Add item to items array
                if(property.sold) {
                    properties.push( {
                        totalPrice: property.price,
                        propertyId: property.tokenId,
                        owner: tokenOwner,
                        address: metadata.address,
                        description: metadata.description,
                        image: metadata.image
                    })
                }
                else {
                    onsold.push( {
                        totalPrice: property.price,
                        propertyId: property.tokenId,
                        owner: tokenOwner,
                        address: metadata.address,
                        description: metadata.description,
                        image: metadata.image
                    })
                }
            }
        }
        setLoading(false)
        setProperties(properties)
    }
    const putOnSale = async (property) => {
        if (!price) {
            window.alert("Please fill the price");
            return
        }
        const metaAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if(metaAccount[0] === account) {
            const tx = await propertyplace.putOnSale(property.propertyId, ethers.utils.parseEther(price)).catch((e) => {
                window.alert(e.data.message);
            });
            const rc = await tx.wait(); // 0ms, as tx is already confirmed
            const event = rc.events.find(event => event.event === 'InvoiceCreated');
            loadPurchasedProperties()
        } else {
            window.alert("Your MetaMask Is different, Please change your account");
        }
    }

    useEffect(() => {
        loadPurchasedProperties()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
    )
    return (
        <div className="flex justify-center">
        {properties.length || onsold.length > 0 ?
            <div className="px-5 py-3 container">
                <h2>Purchase Property</h2>
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {properties.map((property, idx) => (
                    <Col key={idx} className="overflow-hidden">
                        <Card>
                        <Card.Img variant="top" src={property.image} />
                        <Card.Body color="secondary">
                            <Card.Title>
                                <b>Address: </b>{property.address}
                            </Card.Title>
                            <Card.Text>
                                <b>Description: </b>{property.description}
                            </Card.Text>
                            <Card.Text>
                                <b>Owner: </b>{property.owner.slice(0, 5) + '...' + property.owner.slice(38,42)}
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <b><label for="fname">Insert Updated Price: </label></b><br />
                            <input type="number" id="fname" name="fname" onChange={(e) => setPrice(e.target.value)}/><br /><br />
                            <Button onClick={() => putOnSale(property)} variant="primary" size="lg">
                                PutOnSell
                            </Button>
                        </Card.Footer>
                        </Card>
                    </Col>
                    ))}
                </Row>
                {onsold.length > 0 && OnSoldProperties(onsold)}
            </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No purchases</h2>
          </main>
        )}
    </div>
    )

}

export default MyPurchases;