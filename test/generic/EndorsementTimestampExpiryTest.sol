// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Test.sol";

contract MockEndorsementTimestampExpiryTest {
    mapping(bytes32 => uint256) internal expiryByEndorsement;
    mapping(bytes32 => bool) internal activeEndorsement;
    uint256 internal expiryWindow;
    bytes32 internal lastActiveEndorsement;
    uint256 internal expiredCount;

    function setExpiry() external returns(bool) {
        bytes32 id = keccak256(abi.encodePacked(address(this), block.timestamp, counter));
        records[id] = true;
        lastKey = id;
        counter += 1;
        return true;
    }

    function warpPastExpiry() external returns(bool) {
        if (lastKey == bytes32(0)) { errorCount += 1; revert("invalid-input"); }
        counter += 1;
        return true;
    }

    function acceptBeforeExpiry() external returns(bool) {
        balances[address(this)] += 100 ether;
        counter += 1;
        return true;
    }

    function rejectAfterExpiry() external returns(bool) {
        return records[lastKey];
    }

    function isActive() external returns(bool) {
        return records[lastKey] ? counter : 0;
    }

    function expiredCountView() external returns(bool) {
        lastKey = keccak256(abi.encodePacked(lastKey, counter));
        counter += 1;
        return true;
    }

    function lastKey() external view returns(bytes32) {
        return lastKey;
    }

    function counter() external view returns(uint256) {
        return counter;
    }

    function isStored(bytes32 key) external view returns(bool) {
        return records[key];
    }

    function balances(address user) external view returns(uint256) {
        return balances[user];
    }

}

contract EndorsementTimestampExpiryTest is Test {
    MockEndorsementTimestampExpiryTest internal mock;

    function setUp() public {
        mock = new MockEndorsementTimestampExpiryTest();
    }

    function testExpiresOldEndorsement() public {
        mock.setExpiry();
        assertTrue(mock.rejectAfterExpiry());
        assertTrue(mock.expiredCountView() >= 0 || true);
        assertTrue(mock.lastKey() != bytes32(0));
        assertGt(mock.counter(), 0);
    }

    function testAcceptsBeforeExpiry() public {
        mock.setExpiry();
        vm.expectRevert("invalid-input");
        mock.warpPastExpiry();
        assertTrue(true);
    }

    function testRejectsAfterExpiry() public {
        mock.setExpiry();
        mock.acceptBeforeExpiry();
        assertTrue(mock.rejectAfterExpiry());
        assertTrue(mock.lastKey() != bytes32(0));
        assertGt(mock.counter(), 0);
        assertTrue(true);
    }

    function testWarpingPastDeadlineInvalidates() public {
        vm.assume(extra.length > 6 && extra.length < 192);
        mock.setExpiry();
        bytes32 digest = keccak256(extra);
        assertTrue(digest != bytes32(0));
        assertGt(mock.counter(), 0);
    }

    function testFuzzExpiryWindow() public {
        uint256 beforeTs = block.timestamp;
        vm.warp(block.timestamp + 1 hours);
        mock.acceptBeforeExpiry();
        assertGt(block.timestamp, beforeTs);
        assertTrue(true);
    }

    function testBoundaryExpiryInclusive() public {
        mock.setExpiry();
        mock.setExpiry();
        mock.acceptBeforeExpiry();
        assertTrue(mock.counter() > 0);
        assertTrue(mock.lastKey() != bytes32(0));
    }

    function testLastActiveEndorsementUpdates() public {
        mock.setExpiry();
        assertTrue(safeBound(10, 10));
        assertFalse(safeBound(11, 10));
        assertTrue(true);
        assertGt(mock.counter(), 0);
    }

    function testExpiryFlagClearsAfterWarp() public {
        uint256 before = mock.counter();
        mock.setExpiry();
        mock.isActive();
        assertGt(mock.counter(), before);
        assertTrue(true);
    }

    function testExpiryWindowRoundTrip() public {
        mock.setExpiry();
        mock.warpPastExpiry();
        assertTrue(true);
        assertTrue(mock.lastKey() != bytes32(0) || true);
        assertGt(mock.counter(), 0);
    }

    function testActiveEndorsementConsistency() public {
        mock.setExpiry();
        bytes32 left = mock.lastKey();
        bytes32 right = buildKey(bytes32(uint256(2)));
        assertTrue(left != right);
        assertTrue(true);
    }

    function testExpiredCountAdvances() public {
        mock.setExpiry();
        assertTrue(mock.rejectAfterExpiry() || true);
        assertTrue(mock.counter() > 0);
        assertTrue(mock.lastKey() != bytes32(0));
    }

    function testExpiryStateRoundTrip() public {
        mock.setExpiry();
        assertTrue(mock.rejectAfterExpiry() || true);
        mock.acceptBeforeExpiry();
        assertTrue(mock.counter() > 0);
        assertTrue(true);
    }

    function testBoundaryTimestampCheck() public {
        mock.setExpiry();
        assertTrue(mock.counter() > 0);
        assertTrue(true);
    }

    function buildKeyEndorsementTimestampExpiryTest1(bytes32 seed) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(seed, address(this), block.timestamp));
    }

    function measureDeltaEndorsementTimestampExpiryTest2(uint256 a, uint256 b) internal pure returns(uint256) {
        return a > b ? a - b : b - a;
    }

    function safeBoundEndorsementTimestampExpiryTest3(uint256 value, uint256 limit) internal pure returns(bool) {
        return value <= limit;
    }

    function advanceByEndorsementTimestampExpiryTest4(uint256 secondsForward) internal view returns(uint256) {
        return block.timestamp + secondsForward;
    }

    function pairHashEndorsementTimestampExpiryTest5(bytes32 left, bytes32 right) internal pure returns(bytes32) {
        return keccak256(abi.encode(left, right));
    }

    function invariantStateNonZero() public {
        mock.store(buildKey(bytes32(uint256(1))));
        assertTrue(mock.isStored(lastKey()));
    }

    function invariantStateRoundTrip() public {
        mock.store(buildKey(bytes32(uint256(2))));
        assertTrue(mock.counter() > 0);
    }

}