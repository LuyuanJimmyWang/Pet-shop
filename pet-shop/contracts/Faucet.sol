// SPDX-License-Identifier: CC-BY-SA-4.0

// Version of Solidity compiler this program was written for
pragma solidity ^0.5.0;

// Our first contract is a faucet!
contract Faucet {

    uint pet_count = 0;
    enum AgeGroup{ALL, ZERO, ONE, TWO, THREE, FOURNPLUS}
    enum BreedGroup{ALL, B1, B2, B3, B4, OTHER}
    enum LocationGroup{ALL, AB, BC, MB, NB, NL, NT, NS, NU, ON, PE, QC, SK, YT}
    enum AdoptionStatus{ALL, ADOPTED, UNADOPTED}

    struct Pet{
        string petName;
        address owner;
        AgeGroup age;
        BreedGroup breed;
        string city;
        LocationGroup location;
        uint votes;
    }

    event VOTE_MSG(
        uint status
    );

    mapping (uint => Pet) pets;
    mapping (uint => mapping (address => bool)) votes;
    
    function insert_pet(string memory petName, uint id, uint age, uint breed, string memory city, uint location, uint pet_votes) public {
        if (id >= pet_count){
            pets[id] = Pet(petName, address(0),AgeGroup(age),BreedGroup(breed),city,LocationGroup(location),pet_votes);
            pet_count++;
        }   
    }
    
    // add a new pet
    function register_new_pet(string memory petName, uint age, uint breed, string memory city, uint location) public payable returns (uint) {
        insert_pet(petName, pet_count, age, breed, city, location, 0);
        // return the id of this pet
        return pet_count;
    }
    // adopt a pet
    function adopt(uint id) public {
        pets[id].owner = msg.sender;
    }

    function return_pet(uint id) public payable {
        pets[id].owner = address(0);
    }

    // unvote it if the user already voted this pet, vote it otherwise
    function vote_unvote(uint id) public returns (uint) {
        if (!votes[id][msg.sender]){
            votes[id][msg.sender] = true;
            pets[id].votes++;
            emit VOTE_MSG(1);
            
        }else{
            votes[id][msg.sender] = false;
            pets[id].votes--;
            emit VOTE_MSG(0);
        }
        return pets[id].votes;
    }

    function get_pet_vote(uint id) public view returns (uint) {
        return pets[id].votes;
    }
    
    function is_voted(uint id) public view returns (bool) {
        return votes[id][msg.sender];
    }

    // get the votes for pet with id
    function get_voted_pets() public view returns(bool[] memory){
        bool[] memory result = new bool[](pet_count);
        for (uint i = 0; i < pet_count; i++) {
           result[i] = votes[i][msg.sender];
       }
       return result;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[] memory) {
       address[] memory result = new address[](pet_count);
       for (uint i = 0; i < pet_count; i++) {
           result[i] = pets[i].owner;
       }
       return result;
    }

    function is_adopted(uint id) public view returns (bool) {
        if (pets[id].owner == msg.sender){
            return true;
        }
        return false;
    } 

    function getPetById(uint id) public view returns (string memory, uint, uint, string memory, uint, uint){
        require(id < pet_count);
        return (pets[id].petName,
                uint(pets[id].age),
                uint(pets[id].breed),
                pets[id].city,
                uint(pets[id].location),
                pets[id].votes);
    }

    // Retrieving the adopters
    function getMyPets() public view returns (bool[] memory) {
       bool[] memory result = new bool[](pet_count);
       for (uint i = 0; i < pet_count; i++) {
           if (pets[i].owner == msg.sender){
               result[i] = true;
           }
       }
       return result;
    }

    // get pet info
    function get_info() public view returns (uint) {
        return pet_count;
    }

    // filter_pet function takes 4 decision variables to filter the pet to render
    // adopted has three states 0 - ALL, 1 - Adopted, 2 - Not Adopted
    // age, breed, location all have 6 states, refer to enum above
    function filter_pets(uint adopted, uint age, uint breed, uint location, uint own_by_me) public view returns (bool[] memory){
        bool[] memory result = new bool[](pet_count);
        for (uint i = 0; i < pet_count; i++) {
            result[i] = true;
            // check if fall in the filter option
            // adopted 3 options: 0 - both  1 - adopted 2 - not adopted
            if (adopted == 2 && pets[i].owner != address(0) || adopted == 1 && pets[i].owner == address(0)){
                result[i] = false;
                continue;
            }
            if (age != uint(AgeGroup.ALL) && uint(pets[i].age) != age){
                result[i] = false;
                continue;
            }
            // use enum or int to represent here
            if (breed != uint(BreedGroup.ALL) && uint(pets[i].breed) != breed){
                result[i] = false;
                continue;
            }
            if (location != uint(LocationGroup.ALL) && uint(pets[i].location) != location){
                result[i] = false;
                continue;
            }
            if ((own_by_me == 1 && pets[i].owner != msg.sender) || (own_by_me == 2 && pets[i].owner == msg.sender)){
                result[i] = false;
                continue;
            }
        }
        return result;
    }

}