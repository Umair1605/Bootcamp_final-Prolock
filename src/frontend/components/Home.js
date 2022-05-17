import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

const Home = ({ propertyplace,account }) => {
    const [loading, setLoading] = useState(true)
    const [properties, setProperties] = useState([])
    //Load Properties
    const loadProperties = async () => {    
        const propertyCount =  await (propertyplace._tokenIds());
        for (let i = 1; i <= propertyCount; i++) {
            const property = await propertyplace.properties(i)
            if (!property.sold) {
                // get uri url from propertyPlace contract
                const uri = await propertyplace.tokenURI(property.tokenId)       
                // use uri to fetch the property metadata stored on ipfs 
                const response = await fetch(uri)
                const metadata = await response.json()
                const tokenOwner = await propertyplace.ownerOf(property.tokenId) 
                // Add to properties array
                properties.push({
                    totalPrice: property.price,
                    propertyId: property.tokenId,
                    owner: tokenOwner,
                    address: metadata.address,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setLoading(false)
        setProperties(properties)
    }
    const buyProperty = async (property) => {
        const tx = await propertyplace.purchaseProperty(property.propertyId, { value: property.totalPrice }).catch((e) => {
            window.alert(e.data.message);
        });
		const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.events.find(event => event.event === 'Bought');
        loadProperties()
    }
    useEffect(() => {
        console.log(propertyplace._tokenIds);
        loadProperties()
    }, [])
    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
    )
    return (
        <div className="flex justify-center">
            {properties.length > 0 ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {properties.map((property, idx) => (
                        <Col key={idx} className="overflow-hidden">
                            <Card>
                                <Card.Img variant="top" src={property.image} />
                                <Card.Body color="secondary">
                                    <Card.Title>
                                        <b>Address:</b> {property.address}
                                    </Card.Title>
                                    <Card.Text>
                                        <b>Description:</b> {property.description}
                                    </Card.Text>
                                    <Card.Text>
                                        <b>Owner:</b> {property.owner.slice(0, 5) + '...' + property.owner.slice(38,42)}
                                    </Card.Text>
                                </Card.Body>
                                {account ? (
                                    <Card.Footer>
                                        <div className='d-grid'>                                        
                                            <Button onClick={() => buyProperty(property)} variant="primary" size="lg">
                                                Buy for {ethers.utils.formatEther(property.totalPrice)} ETH
                                            </Button>        
                                        </div>
                                    </Card.Footer> 
                                ): null }
                            </Card>
                        </Col>
                        ))}
                    </Row>
                </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2>No listed assets</h2>
                    </main>
                )}
        </div>
    )
}
export default Home;