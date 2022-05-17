// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error HasZeroAddress(address account);
error InvalidPrice(uint price);
error InvalidId(uint tokenId);
error NotOnSale(uint id);
error AlreadyOnSale(uint id);
error UnauthorizedBuyer(address owner);
error InsufficientBalance(uint256 availableBalance,uint256 requiredBalance);
error IsNotOwner(address availableAddress , address requiredAddress);

contract PropertyPlace is ERC721URIStorage,Ownable,Pausable{

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    struct Property {
        uint tokenId;
        uint price;
        address payable creator;
        bool sold;
    }
    //event called
    event Offered(
        uint tokenId,
        uint price,
        address indexed creator
    );
    event Bought(
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );
    event PutOnpurchase(
        uint tokenId,
        uint price,
        address indexed owner
    );
    //mapping
    mapping(uint => Property) public properties;
    //constructor
    constructor() ERC721("MarketPlace", "NFT") {}
    //register 
    /*
     * @property is register.
     * Function should be perform by @creator.
    */
    function registerProperty (
        string memory tokenURI, 
        uint _price
    ) external  {    
        if (msg.sender == address(0)) revert HasZeroAddress(msg.sender);
        if (_price <= 0) revert InvalidPrice(_price);
        //increment
        _tokenIds.increment();
		uint256 tokenId = _tokenIds.current();
        //mint property
        _mint(msg.sender, tokenId);
        //Set url
        _setTokenURI(tokenId, tokenURI);        
        // add new Property to property 
        properties[tokenId] = Property (
            tokenId,
            _price,
            payable(msg.sender),
            false
        );
        // emit Offered event
        emit Offered(
            tokenId,
            _price,
            msg.sender
        );
    }
    //Purchase Property 
    /*
     * transfer of property from @seller to @buyer.
     * Function should be perform by @buyer.
    */
    function purchaseProperty (
        uint _tokenID
    ) external whenNotPaused payable  {
        if (_tokenID <= 0 || _tokenID > _tokenIds.current()) revert InvalidId(_tokenID);
        Property storage property = properties[_tokenID];
        if (msg.sender == address(0)) revert HasZeroAddress(msg.sender);
        if (ownerOf(_tokenID) == msg.sender) revert UnauthorizedBuyer(msg.sender);
        if (msg.value < property.price) revert InsufficientBalance(msg.value,property.price);
        if (property.sold) revert NotOnSale(_tokenID);
        //get previous owner
        address previousOwner = ownerOf(_tokenID);
        //transfer ether
        payable(ownerOf(_tokenID)).transfer(property.price);
        //transfer property ownership
        _transfer(previousOwner, msg.sender, property.tokenId);
        // update item to sold
        property.sold = true;
        //emit bought event
        emit Bought(
            property.tokenId,
            property.price,
            previousOwner,
            msg.sender
        );
    }
    //PutOnSale 
    /*
     * property list to the sale.
     * Function should be perform by the @owner of property.
    */
    function putOnSale (
        uint _tokenID,
        uint _updatedPrice
    ) external {
        Property storage property = properties[_tokenID];
        if (_updatedPrice <= 0) revert InvalidPrice(_updatedPrice);
        if (msg.sender == address(0)) revert HasZeroAddress(msg.sender);
        if (_tokenID <= 0 && _tokenID > _tokenIds.current()) revert InvalidId(_tokenID);
        if (ownerOf(_tokenID) != msg.sender) revert IsNotOwner(ownerOf(_tokenID),msg.sender);
        if (!property.sold) revert AlreadyOnSale(_tokenID);
        // update item to sold
        property.sold = false;
        property.price = _updatedPrice;
        emit PutOnpurchase(
            property.tokenId,
            property.price,
            ownerOf(_tokenID)
        );
    }
}