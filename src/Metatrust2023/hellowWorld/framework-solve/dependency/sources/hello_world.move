    module challenge::hello_world {
    
    // [*] Import dependencies
    use sui::hash;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // [*] Error Codes
    const ERR_INVALID_CODE : u64 = 31337;
 
    // [*] Structs
    struct Status has key, store {
        id : UID,
        solved : bool,
    }

    // [*] Module initializer
    fun init(ctx: &mut TxContext) {
        transfer::public_share_object(Status {
            id: object::new(ctx),
            solved: false
        });
    }

    // [*] Public functions
    public entry fun answer_to_life(status: &mut Status, answer : vector<u8>) {
        // What is the answer to life?
        let actual = x"2f0039e93a27221fcf657fb877a1d4f60307106113e885096cb44a461cd0afbf";
        let answer_hash: vector<u8> = hash::blake2b256(&answer);
        assert!(actual == answer_hash, ERR_INVALID_CODE);
        status.solved = true;

    }

    public entry fun is_owner(status: &mut Status) {
        assert!(status.solved == true, 0);
    }

}

