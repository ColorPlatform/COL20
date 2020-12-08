pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./ERC20.sol";
import "./SafeMath.sol";

/// @title Implementation of basic ERC20 function.
/// @notice The only difference from most other ERC20 contracts is that we introduce 2 superusers - the founder and the admin.
contract _Base20 is ERC20 {
  using SafeMath for uint256;

  mapping (address => mapping (address => uint256)) internal allowed;

  mapping(address => uint256) internal accounts;

  address internal admin;

  address payable internal founder;

  uint256 internal __totalSupply;

  constructor(uint256 _totalSupply,
    address payable _founder,
    address _admin) public {
      __totalSupply = _totalSupply;
      admin = _admin;
      founder = _founder;
      accounts[founder] = __totalSupply;
      emit Transfer(address(0), founder, accounts[founder]);
    }

    // define onlyAdmin
    modifier onlyAdmin {
      require(admin == msg.sender, "Only admin can do this operation");
      _;
    }

    // define onlyFounder
    modifier onlyFounder {
      require(founder == msg.sender, "Only founder can do this operation");
      _;
    }

    modifier superuser {
      require(founder == msg.sender || admin == msg.sender,
        "Only admin and founder can do this operation"
      );
      _;
    }

    // This function is disabled, The Founder is forever founder
    // Change founder
    // function changeFounder(address payable who) onlyFounder public {
    //   require(who != address(0), "Unusable address for the new founder");
    //   _transfer(founder, who, balanceOf(founder));
    //   founder = who;
    // }

    // show founder address
    function getFounder() public view returns (address) {
      return founder;
    }

    // show admin address
    function getAdmin() public view returns (address) {
      return admin;
    }

    // Change admin
    function changeAdmin(address who) onlyFounder public virtual {
      admin = who;
    }

    //
    // ERC20 spec.
    //
    function totalSupply() override public view returns (uint256) {
      return __totalSupply;
    }

    // ERC20 spec.
    function balanceOf(address _owner) override virtual public view returns (uint256) {
      return accounts[_owner];
    }

    function _transfer(address _from, address _to, uint256 _value) 
    internal virtual returns (bool) {
      require(_to != address(0), "To burn coins use 'decreaseSupply'");

      require(_value <= accounts[_from], "Not enough funds to transfer");

      // This should go first. If SafeMath.add fails, the sender's balance is not changed
      accounts[_to] = accounts[_to].add(_value);
      accounts[_from] = accounts[_from].sub(_value);

      emit Transfer(_from, _to, _value);

      return true;
    }
    // ERC20 spec.
    function transfer(address _to, uint256 _value) override public virtual returns (bool) {
      return _transfer(msg.sender, _to, _value);
    }

    // ERC20 spec.
    function transferFrom(address _from, address _to, uint256 _value) override virtual 
    public returns (bool) {
      require(_value <= allowed[_from][msg.sender], "Not enough funds allowed");

      // _transfer is either successful, or throws.
      _transfer(_from, _to, _value);

      allowed[_from][msg.sender] -= _value;
      emit Approval(_from, msg.sender, allowed[_from][msg.sender]);

      return true;
    }

    // ERC20 spec.
    function approve(address _spender, uint256 _value) override virtual public returns (bool) {
      allowed[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value);
      return true;
    }

    // ERC20 spec.
    function allowance(address _owner, address _spender) override public virtual view returns (uint256) {
      return allowed[_owner][_spender];
    }
}
