// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*

Core Features:
- Deposit / Withdraw
- Reward Accrual
- Optimized loops
- Storage caching
- Gas efficient design

Analogy:
Think of this as a bank:
- balances = account balance
- rewards = interest
- loops = batch processing customers

===============================================================================
*/

contract UltraOptimizedVaultSystem {

    /* -------------------------------------------------------------------------- */
    /*                               CUSTOM ERRORS                                */
    /* -------------------------------------------------------------------------- */

    error NotOwner();
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();

    /* -------------------------------------------------------------------------- */
    /*                               STATE STORAGE                                */
    /* -------------------------------------------------------------------------- */

    struct UserInfo {
        uint256 balance;
        uint256 rewardDebt;
        uint256 lastUpdate;
    }

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    mapping(address => UserInfo) internal users;

    address[] internal userList;

    mapping(address => bool) internal exists;

    uint256 public totalDeposits;
    uint256 public rewardRate; // per second
    uint256 public constant PRECISION = 1e18;

    address public immutable owner;

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor(uint256 _rate) {
        owner = msg.sender;
        rewardRate = _rate;
        _status = _NOT_ENTERED;
    }

    /* -------------------------------------------------------------------------- */
    /*                         INTERNAL CORE LOGIC                                 */
    /* -------------------------------------------------------------------------- */

    function _addUser(address user) internal {
        if (!exists[user]) {
            exists[user] = true;
            userList.push(user);
        }
    }

    /*
    ============================================================================
    REWARD CALCULATION (GAS OPTIMIZED)
    ============================================================================
    */

    function _calculateReward(address userAddr) internal view returns (uint256) {
        UserInfo storage user = users[userAddr];

        if (user.balance == 0) return 0;

        uint256 timeDiff = block.timestamp - user.lastUpdate;

        return (user.balance * rewardRate * timeDiff) / PRECISION;
    }

    /*
    ============================================================================
    UPDATE USER STATE
    ============================================================================
    */

    function _updateUser(address userAddr) internal {

        UserInfo storage user = users[userAddr];

        uint256 reward = _calculateReward(userAddr);

        if (reward > 0) {
            user.rewardDebt += reward;
        }

        user.lastUpdate = block.timestamp;
    }

    /* -------------------------------------------------------------------------- */
    /*                             USER FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    function deposit() external payable nonReentrant {

        uint256 amount = msg.value;
        if (amount == 0) revert ZeroAmount();

        _addUser(msg.sender);

        _updateUser(msg.sender);

        UserInfo storage user = users[msg.sender];

        user.balance += amount;

        totalDeposits += amount;

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {

        if (amount == 0) revert ZeroAmount();

        UserInfo storage user = users[msg.sender];

        if (user.balance < amount) revert InsufficientBalance();

        _updateUser(msg.sender);

        user.balance -= amount;
        totalDeposits -= amount;

        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Withdraw(msg.sender, amount);
    }

    function claimReward() external nonReentrant {

        _updateUser(msg.sender);

        UserInfo storage user = users[msg.sender];

        uint256 reward = user.rewardDebt;

        if (reward == 0) revert ZeroAmount();

        user.rewardDebt = 0;

        (bool ok,) = msg.sender.call{value: reward}("");
        if (!ok) revert TransferFailed();

        emit RewardClaimed(msg.sender, reward);
    }

    /* -------------------------------------------------------------------------- */
    /*                        LOOP OPTIMIZATION SECTION                            */
    /* -------------------------------------------------------------------------- */

    /*
    BAD VERSION (for comparison)
    */
    function sumBalancesBad() external view returns (uint256 total) {
        for (uint256 i = 0; i < userList.length; i++) {
            total += users[userList[i]].balance;
        }
    }

    /*
    OPTIMIZED VERSION
    */
    function sumBalancesOptimized() external view returns (uint256 total) {

        uint256 len = userList.length;

        for (uint256 i; i < len;) {

            total += users[userList[i]].balance;

            unchecked { ++i; }
        }
    }

    /*
    EXTREME OPTIMIZATION (CACHING STRUCT)
    */
    function sumBalancesAdvanced() external view returns (uint256 total) {

        uint256 len = userList.length;

        for (uint256 i; i < len;) {

            address u = userList[i];

            UserInfo storage user = users[u];

            total += user.balance;

            unchecked { ++i; }
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                    BATCH PROCESSING (IMPORTANT PART)                        */
    /* -------------------------------------------------------------------------- */

    function batchUpdate(uint256 start, uint256 end) external {

        uint256 len = userList.length;

        if (end > len) end = len;

        for (uint256 i = start; i < end;) {

            _updateUser(userList[i]);

            unchecked { ++i; }
        }
    }

    /*
    WHY THIS MATTERS:

    Instead of:
    - Looping entire array (gas bomb)

    We:
    - Process in chunks
    - Prevent block gas limit failure
    */

    /* -------------------------------------------------------------------------- */
    /*                             VIEW FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    function getUser(address userAddr)
        external
        view
        returns (uint256 balance, uint256 reward, uint256 lastUpdate)
    {
        UserInfo storage user = users[userAddr];

        balance = user.balance;
        reward = user.rewardDebt + _calculateReward(userAddr);
        lastUpdate = user.lastUpdate;
    }

    function getTotalUsers() external view returns (uint256) {
        return userList.length;
    }

    function getTotalDeposits() external view returns (uint256) {
        return totalDeposits;
    }

}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
===============================================================================
===============================================================================

Focus:
- Advanced batch reward distribution
- Pagination-based processing
- Struct packing optimization
- Multi-loop efficiency
- Snapshot-based accounting

===============================================================================
*/

contract UltraOptimizedVaultSystem_Part2 {

    /* -------------------------------------------------------------------------- */
    /*                          PACKED STRUCT OPTIMIZATION                         */
    /* -------------------------------------------------------------------------- */

    /*
    Packing reduces storage slots → saves gas

    Before:
    uint256 + uint256 + uint256 = 3 slots

    After packing:
    uint128 + uint64 + uint64 = 1 slot
    */

    struct PackedUser {
        uint128 balance;
        uint64 lastUpdate;
        uint64 rewardDebt;
    }

    mapping(address => PackedUser) internal users;

    address[] internal userList;

    mapping(address => bool) internal exists;

    uint256 public totalDeposits;
    uint256 public rewardRate;

    address public immutable owner;

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event BatchRewardDistributed(uint256 start, uint256 end);
    event SnapshotCreated(uint256 id, uint256 totalUsers);

    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error NotOwner();
    error InvalidRange();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(uint256 _rate) {
        owner = msg.sender;
        rewardRate = _rate;
    }

    /* -------------------------------------------------------------------------- */
    /*                          INTERNAL HELPER LOGIC                              */
    /* -------------------------------------------------------------------------- */

    function _addUser(address user) internal {
        if (!exists[user]) {
            exists[user] = true;
            userList.push(user);
        }
    }

    function _calculateReward(PackedUser storage user) internal view returns (uint256) {
        if (user.balance == 0) return 0;

        uint256 timeDiff = block.timestamp - user.lastUpdate;

        return (uint256(user.balance) * rewardRate * timeDiff) / 1e18;
    }

    function _updateUser(address userAddr) internal {

        PackedUser storage user = users[userAddr];

        uint256 reward = _calculateReward(user);

        if (reward > 0) {
            user.rewardDebt += uint64(reward);
        }

        user.lastUpdate = uint64(block.timestamp);
    }

    /* -------------------------------------------------------------------------- */
    /*                         PAGINATED BATCH PROCESSING                          */
    /* -------------------------------------------------------------------------- */

    /*
    Instead of processing all users in one tx (gas limit risk),
    we process chunks safely.
    */

    function batchProcess(uint256 start, uint256 size) external onlyOwner {

        uint256 len = userList.length;

        if (start >= len) revert InvalidRange();

        uint256 end = start + size;
        if (end > len) end = len;

        for (uint256 i = start; i < end;) {

            _updateUser(userList[i]);

            unchecked { ++i; }
        }

        emit BatchRewardDistributed(start, end);
    }

    /* -------------------------------------------------------------------------- */
    /*                     MULTI-LOOP OPTIMIZATION EXAMPLE                         */
    /* -------------------------------------------------------------------------- */

    /*
    BAD: multiple loops
    */
    function badMultiLoop() external view returns (uint256 total) {

        uint256 len = userList.length;

        for (uint256 i = 0; i < len; i++) {
            total += users[userList[i]].balance;
        }

        for (uint256 i = 0; i < len; i++) {
            total += users[userList[i]].rewardDebt;
        }
    }

    /*
    GOOD: single loop
    */
    function optimizedMultiLoop() external view returns (uint256 total) {

        uint256 len = userList.length;

        for (uint256 i; i < len;) {

            PackedUser storage user = users[userList[i]];

            total += user.balance;
            total += user.rewardDebt;

            unchecked { ++i; }
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                           SNAPSHOT SYSTEM                                   */
    /* -------------------------------------------------------------------------- */

    struct Snapshot {
        uint256 totalUsers;
        uint256 totalDeposits;
        uint256 timestamp;
    }

    mapping(uint256 => Snapshot) public snapshots;

    uint256 public snapshotCount;

    function createSnapshot() external onlyOwner {

        uint256 id = snapshotCount;

        snapshots[id] = Snapshot({
            totalUsers: userList.length,
            totalDeposits: totalDeposits,
            timestamp: block.timestamp
        });

        snapshotCount++;

        emit SnapshotCreated(id, userList.length);
    }

    /* -------------------------------------------------------------------------- */
    /*                     BATCH REWARD DISTRIBUTION                               */
    /* -------------------------------------------------------------------------- */

    function distributeFixedReward(uint256 rewardPerUser, uint256 start, uint256 end)
        external
        onlyOwner
    {
        uint256 len = userList.length;

        if (start >= len) revert InvalidRange();
        if (end > len) end = len;

        for (uint256 i = start; i < end;) {

            PackedUser storage user = users[userList[i]];

            user.rewardDebt += uint64(rewardPerUser);

            unchecked { ++i; }
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                       MEMORY VS STORAGE OPTIMIZATION                        */
    /* -------------------------------------------------------------------------- */

    /*
    BAD: multiple storage reads
    */
    function badStorageAccess(address userAddr) external view returns (uint256) {
        return users[userAddr].balance +
               users[userAddr].balance +
               users[userAddr].balance;
    }

    /*
    GOOD: cached storage
    */
    function optimizedStorageAccess(address userAddr) external view returns (uint256) {

        PackedUser storage user = users[userAddr];

        uint256 bal = user.balance;

        return bal + bal + bal;
    }

    /* -------------------------------------------------------------------------- */
    /*                       CONDITIONAL OPTIMIZATION                              */
    /* -------------------------------------------------------------------------- */

    function optimizedBranch(uint256 x) external pure returns (uint256) {

        if (x < 10) return x;
        if (x < 100) return x * 2;

        return x * 3;
    }

    /*
    Avoid deep nesting:
    BAD:
    if (...) {
        if (...) {
            if (...) {
            }
        }
    }
    */

    /* -------------------------------------------------------------------------- */
    /*                       ARRAY PAGINATION HELPER                               */
    /* -------------------------------------------------------------------------- */

    function getUsers(uint256 start, uint256 size)
        external
        view
        returns (address[] memory result)
    {
        uint256 len = userList.length;

        if (start >= len) return new address[](0);

        uint256 end = start + size;
        if (end > len) end = len;

        uint256 newLen = end - start;

        result = new address[](newLen);

        for (uint256 i; i < newLen;) {

            result[i] = userList[start + i];

            unchecked { ++i; }
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                         GAS PATTERN SUMMARY                                 */
    /* -------------------------------------------------------------------------- */

    /*
    Key takeaways:
    - Always cache length
    - Always use unchecked increment
    - Merge loops when possible
    - Use pagination for scalability
    - Pack structs to reduce storage cost
    */

}