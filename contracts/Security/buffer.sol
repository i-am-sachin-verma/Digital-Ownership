// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



/*
    PROBLEM:
    Large inline Base64 libraries
    increase deployment bytecode size.

    SOLUTION:
    Move encoding logic into an
    external helper contract.

    BENEFITS:
    - smaller main contract
    - cheaper deployment
    - reusable encoder
    - modular architecture
*/



interface IBase64Encoder {

    function encode(
        bytes calldata data
    )
        external
        pure
        returns(string memory);
}



contract ExternalBase64Encoder
    is IBase64Encoder
{

    string internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";



    function encode(
        bytes calldata data
    )
        external
        pure
        override
        returns(string memory)
    {

        if (data.length == 0) {
            return "";
        }



        string memory table = TABLE;



        uint256 encodedLen =
            4 * (
                (data.length + 2) / 3
            );



        string memory result =
            new string(encodedLen + 32);



        assembly {

            let tablePtr :=
                add(table, 1)

            let resultPtr :=
                add(result, 32)

            for {

                let i := 0

            } lt(i, data.length) {

                i := add(i, 3)

            } {

                let input :=
                    and(
                        calldataload(
                            add(data.offset, i)
                        ),
                        0xffffff
                    )

                let out :=
                    mload(
                        add(
                            tablePtr,
                            and(
                                shr(18, input),
                                0x3F
                            )
                        )
                    )

                out := shl(8, out)

                out := add(
                    out,
                    and(
                        mload(
                            add(
                                tablePtr,
                                and(
                                    shr(12, input),
                                    0x3F
                                )
                            )
                        ),
                        0xFF
                    )
                )

                out := shl(8, out)

                out := add(
                    out,
                    and(
                        mload(
                            add(
                                tablePtr,
                                and(
                                    shr(6, input),
                                    0x3F
                                )
                            )
                        ),
                        0xFF
                    )
                )

                out := shl(8, out)

                out := add(
                    out,
                    and(
                        mload(
                            add(
                                tablePtr,
                                and(
                                    input,
                                    0x3F
                                )
                            )
                        ),
                        0xFF
                    )
                )

                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr :=
                    add(resultPtr, 4)
            }

            switch mod(data.length, 3)

            case 1 {

                mstore(
                    sub(resultPtr, 2),
                    shl(240, 0x3d3d)
                )
            }

            case 2 {

                mstore(
                    sub(resultPtr, 1),
                    shl(248, 0x3d)
                )
            }

            mstore(result, encodedLen)
        }



        return result;
    }
}



contract LightweightMetadataRenderer {



    IBase64Encoder
        public immutable encoder;



    constructor(
        address encoderAddress
    ) {

        encoder =
            IBase64Encoder(
                encoderAddress
            );
    }



    function generateMetadata(

        string memory name,

        string memory role,

        uint256 reputation

    )
        external
        view
        returns(string memory)
    {

        bytes memory json =
            abi.encodePacked(

                '{"name":"',
                name,

                '","role":"',
                role,

                '","reputation":"',

                _toString(reputation),

                '"}'
            );



        string memory encoded =
            encoder.encode(json);



        return string(

            abi.encodePacked(
                "data:application/json;base64,",
                encoded
            )
        );
    }



    function _toString(
        uint256 value
    )
        internal
        pure
        returns(string memory)
    {

        if (value == 0) {
            return "0";
        }



        uint256 temp =
            value;

        uint256 digits;



        while (temp != 0) {

            digits++;

            temp /= 10;
        }



        bytes memory buffer =
            new bytes(digits);



        while (value != 0) {

            digits -= 1;

            buffer[digits] = bytes1(
                uint8(
                    48 + uint256(
                        value % 10
                    )
                )
            );

            value /= 10;
        }



        return string(buffer);
    }
}