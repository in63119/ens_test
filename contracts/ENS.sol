pragma solidity ^0.8.0;

contract ENS {
  // ENS의 상태 변수
  mapping(string => address) addresses;

  // ENS의 생성자 함수
  constructor() {
    // ENS에 기본 도메인 이름을 등록합니다.
    addresses["init.eth"] = address(0x0);
  }

  // ENS에 도메인 이름을 등록하는 함수
  function register(string memory _name, address _address) public {
    address addr = addresses[_name];
    // 도메인 이름이 이미 등록되어 있는지 확인합니다.
    require(addr == addresses[_name], "This address is already registered.");

    // 도메인 이름을 등록합니다.
    addresses[_name] = _address;
  }

  // ENS에서 도메인 이름을 조회하는 함수
  function resolve(string memory _name) public view returns (address) {
    address addr = addresses[_name];
    // 도메인 이름이 등록되어 있는지 확인합니다.
    require(addr == addresses[_name], "This is an unregistered address.");

    // 도메인 이름에 대한 주소를 반환합니다.
    return addresses[_name];
  }
}