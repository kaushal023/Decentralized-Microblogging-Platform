pragma solidity ^0.5.0;

contract Decentragram {
  string public name;
  uint public postCount = 0;
  mapping(uint => Post) public posts;

  struct Post {
    uint id;
    //string hash;
    string tweet;
    uint tipAmount;
    address payable author;
  }

  event PostCreated(
    uint id,
    string tweet,
    uint tipAmount,
    address payable author
  );

  event PostTipped(
    uint id,
    string tweet,
    uint tipAmount,
    address payable author
  );

  constructor() public {
    name = "Decentragram";
  }

  function uploadPost( string memory _tweet) public {
    // Make sure the post hash exists

    //require(bytes(_imgHash).length > 0);

    // Make sure post tweet exists
    require(bytes(_tweet).length > 0);
    // Make sure uploader address exists
    require(msg.sender!=address(0));

    // Increment post id
    postCount ++;

    // Add Post to the contract
    posts[postCount] = Post(postCount, _tweet, 0, msg.sender);
    // Trigger an event
    emit PostCreated(postCount, _tweet, 0, msg.sender);
  }

  function tipPostOwner(uint _id) public payable {
    // Make sure the id is valid
    require(_id > 0 && _id <= postCount);
    // Fetch the post
    Post memory _post = posts[_id];
    // Fetch the author
    address payable _author = _post.author;
    // Pay the author by sending them Ether
    address(_author).transfer(msg.value);
    // Increment the tip amount
    _post.tipAmount = _post.tipAmount + msg.value;
    // Update the post
    posts[_id] = _post;
    // Trigger an event
    emit PostTipped(_id, _post.tweet, _post.tipAmount, _author);
  }
}
