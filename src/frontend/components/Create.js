import { useState } from 'react'
import { ethers } from "ethers"
import { useNavigate  } from 'react-router-dom'
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Create = ({ propertyplace, account }) => {
    const navigate = useNavigate();
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [address, setAddress] = useState('')
    const [description, setDescription] = useState('')
    
    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error){
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    // Register Property
    const registerProperty = async () => {
        if (!image || !price || !description || !address) {
            window.alert("Please fill the Form");
            return
        }
        try {
            const result = await client.add(JSON.stringify({image, description,address}))
            listProperty(result)
        } catch(error) {
            console.log("ipfs uri upload error: ", error)
        }
    }
    // List Property
    const listProperty = async (result) => {
        const uri = `https://ipfs.infura.io/ipfs/${result.path}`
        const listingPrice = ethers.utils.parseEther(price.toString())
        const tx = await propertyplace.registerProperty(uri, listingPrice).catch((e) => {
            window.alert(e.data.message);
        });
		const rc = await tx.wait(); // 0ms, as tx is already confirmed
        navigate('/');
    }
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control 
                                onChange={(e) => setAddress(e.target.value)} 
                                size="lg" 
                                required as="textarea" 
                                placeholder="Address" 
                            />
                            <Form.Control 
                                onChange={(e) => setDescription(e.target.value)} 
                                size="lg" 
                                required as="textarea" 
                                placeholder="Description" 
                            />
                            <Form.Control 
                                onChange={(e) => setPrice(e.target.value)} 
                                size="lg" 
                                required type="number" 
                                placeholder="Price in ETH" 
                            />
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <div className="d-grid px-0">
                                <Button onClick={registerProperty} variant="primary" size="lg">
                                Create & List NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default Create;