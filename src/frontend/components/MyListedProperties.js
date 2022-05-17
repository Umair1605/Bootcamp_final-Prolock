import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

const MyListedProperties = ({ propertyplace,account }) => {

    const [loading, setLoading] = useState(true)
    const [listedProperties, setListedProperties] = useState([])

    const loadListedProperties = async () => {
        const propertyCount =  await (propertyplace._tokenIds())
        let listedProperties = []
        
        for (let indx = 1; indx <= propertyCount; indx++) {
            const i = await propertyplace.properties(indx)
            if (i.creator.toLowerCase() === account) {
                // get uri url from propertyPlace contract
                const uri = await propertyplace.tokenURI(i.tokenId)
                // use uri to fetch the nft metadata stored on ipfs 
                const response = await fetch(uri)
                const metadata = await response.json()    
                // define listed item object
                let property = {
                    totalPrice: i.price,
                    propertyId: i.tokenId,
                    owner: i.creator,
                    address: metadata.address,
                    description: metadata.description,
                    image: metadata.image
                }
                listedProperties.push(property)
            }
        }
        setLoading(false)
        setListedProperties(listedProperties)
    }

    useEffect(() => {
        loadListedProperties()
    }, [])
    
    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
    )
    return (
        <div className="flex justify-center">
        {listedProperties.length > 0 ?
            <div className="px-5 py-3 container">
                <h2>Listed</h2>
                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                    {listedProperties.map((property, idx) => (
                    <Col key={idx} className="overflow-hidden">
                        <Card>
                            <Card.Img variant="top" src={property.image} />
                            <Card.Body color="secondary">
                                <Card.Title>
                                    Address: {property.address}
                                </Card.Title>
                                <Card.Text>
                                    <b>Description:</b> {property.description}
                                </Card.Text>
                                <Card.Text>
                                    <b>Owner:</b> {property.owner.slice(0, 5) + '...' + property.owner.slice(38,42)}
                                </Card.Text>
                            </Card.Body>
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

export default MyListedProperties;