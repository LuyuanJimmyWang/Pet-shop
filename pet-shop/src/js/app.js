var Provinces = {
  "ALL":0,
  "AB":1, 
  "BC":2,
  "MB":3,
  "NB":4,
  "NL":5,
  "NT":6,
  "NS":7,
  "NU":8,
  "ON":9,
  "PE":10,
  "QC":11,
  "SK":12,
  "YT":13
};

var ProvincesInv = {
  0:"ALL",
  1:"AB", 
  2:"BC",
  3:"MB",
  4:"NB",
  5:"NL",
  6:"NT",
  7:"NS",
  8:"NU",
  9:"ON",
  10:"PE",
  11:"QC",
  12:"SK",
  13:"YT"
};

var Breed = {
  "ALL":0,
  "Boxer":1,
  "French Bulldog":2,
  "Golden Retriever":3,
  "Scottish Terrier":4
};

var BreedInv = {
  0:"ALL",
  1:"Boxer",
  2:"French Bulldog",
  3:"Golden Retriever",
  4:"Scottish Terrier"
};

var Photo = {
  "Boxer":"images/boxer.jpeg",
  "French Bulldog":"images/french-bulldog.jpeg",
  "Golden Retriever":"images/golden-retriever.jpeg",
  "Scottish Terrier":"images/scottish-terrier.jpeg"
};

var Adoption = {
  "ALL":0,
  "Adopted":1,
  "Unadopted":2
};

var Age = {
  "ALL":0,
  "0":1,
  "1":2,
  "2":3,
  "3":4,
  "4+":5
}

var AgeInv = {
  0:"ALL",
  1:"0",
  2:"1",
  3:"2",
  4:"3",
  5:"4+"
}

var Own = {
  "ALL":0,
  "True":1,
  "False":2
}

var length = 0;

function loadPet(id, petName, picture, age, breedName, location, vote) {
  var petsRow = $('#petsRow');
  var petTemplate = $('#petTemplate');
  petTemplate.find('.panel-title').text(petName);
  petTemplate.find('img').attr('src', picture);
  petTemplate.find('.pet-breed').text(breedName);
  petTemplate.find('.pet-age').text(age);
  petTemplate.find('.pet-location').text(location);
  petTemplate.find('.pet-vote').text(vote);
  petTemplate.find('.btn-adopt').attr('data-id', id);
  petTemplate.find('.btn-return').attr('data-id', id);
  petTemplate.find('.btn-vote').attr('data-id', id);
  petsRow.append(petTemplate.html());
  length = length + 1;
}

App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');
      length = data.length;

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.pet-vote').text(data[i].vote);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-return').attr('data-id', data[i].id);
        petTemplate.find('.btn-vote').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);
web3.eth.defaultAccount = web3.eth.accounts[0];

    return App.initContract();
  },

  initContract: async function() {

    $.getJSON('Faucet.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var FaucetArtifact = data;
      App.contracts.Faucet = TruffleContract(FaucetArtifact);
    
      // Set the provider for our contract
      App.contracts.Faucet.setProvider(App.web3Provider);

      App.passBackend();
      App.markAdopted();
      App.markVote();
      App.getFromBackend();
    });

    return App.bindEvents();
  },

  passBackend: async function(){
    var faucetInstance;
    App.contracts.Faucet.deployed().then(function(instance){
      faucetInstance = instance;
      for (i = 0; i < length; i++){
        var petName = $('.panel-pet').eq(i).find('.panel-title').text();
        var age = $('.panel-pet').eq(i).find('.pet-age').text();
        var breed = $('.panel-pet').eq(i).find('.pet-breed').text();
        var location = $('.panel-pet').eq(i).find('.pet-location').text();
        var vote = $('.panel-pet').eq(i).find('.pet-vote').text();
        var province = location.slice(-2);
        var location = location.toString();
        var city = location.substring(0, location.length - 4);
        faucetInstance.insert_pet(petName, i, Age[age], Breed[breed], city, Provinces[province], parseInt(vote, 10));
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  getFromBackend: function(){
    var faucetInstance;
    App.contracts.Faucet.deployed().then(function(instance){
      faucetInstance = instance;
      console.log("petCount", faucetInstance.get_info.call());
      return faucetInstance.get_info.call();
    }).then(async function (pet_count){
      console.log(length);
      console.log(pet_count);
      console.log(pet_count.c[0]);
      var i = length;
      while (i < pet_count){
        console.log(i);
        var pet = await faucetInstance.getPetById.call(i);
        var [petName, age, breed, city, location, vote] = pet;
        var age = AgeInv[age];
        var breed = BreedInv[breed];
        var photo = Photo[breed];
        var location = ProvincesInv[location];
        var location = city.toString() + ', ' + location.toString();
        loadPet(i, petName, photo, age, breed, location, vote);
        i = i + 1;
      }
    }).catch(function(err){
      console.log(err.message);
    });
  },
  
  markVote: function(){
    var faucetInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Faucet.deployed().then(function (instance) {
        faucetInstance = instance;
        return faucetInstance.get_voted_pets.call();
      }).then(async function(voted){
        for (i = 0; i < voted.length; i++){
          var vote = await faucetInstance.is_voted.call(i, {from: account});
          var totalVote = await faucetInstance.get_pet_vote.call(i);
          if (vote == 1){
            $('.panel-pet').eq(i).find('.btn-vote').text('Unvote');
          } else {
            $('.panel-pet').eq(i).find('.btn-vote').text('Vote');
          }
          $('.panel-pet').eq(i).find('.pet-vote').text(totalVote);
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  addPet: function () {
    var faucetInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Faucet.deployed().then(function (instance) {
        faucetInstance = instance;
        var petName = $("#name").val()
        var age = $("#age").val();
        var breed = $("#breed").val();
        var city = $("#city").val();
        var province = $("#province").val();
        var photo = Photo[breed];
        console.log(province);
        return faucetInstance.register_new_pet(petName, Age[age], Breed[breed], city, Provinces[province], {from: account, value: web3.toWei("1","ether")});
      }).then(function (result) {
        return faucetInstance.get_info.call();
      }).then(function (result){
        var petName = $("#name").val()
        var age = $("#age").val();
        var breed = $("#breed").val();
        var city = $("#city").val();
        var province = $("#province").val();
        var photo = Photo[breed];
        var location = city.toString() + ', ' + province.toString();
        console.log(location);
        loadPet(result-1, petName, photo, age, breed, location, 0);
        $('#close_add_pet').click();
        alert("Your pet has been added successfully!", "success")
      }).catch(function (err) {
        alert("Cannot add pet, please try again later!", "danger")
        console.log(err.message);
      });
    });
  },

  handleVote: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var faucetInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Faucet.deployed().then(function (instance) {
        faucetInstance = instance;

        // Execute vote as a transaction by sending account
        return faucetInstance.vote_unvote(petId, {from: account});
      }).then(function (result) {
        return faucetInstance.get_pet_vote.call(petId);
      }).then(function (totalVote) {
        $('.panel-pet').eq(petId).find('.pet-vote').text(totalVote);
        return faucetInstance.is_voted.call(petId);
      }).then(function (isVoted){
        if (isVoted == 1){
          $('.panel-pet').eq(petId).find('.btn-vote').text('Unvote');
          alert("You have successfully voted", 'success');
        } else {
          $('.panel-pet').eq(petId).find('.btn-vote').text('Vote');
          alert("You have successfully unvoted", 'success');
        }
      }).catch(function(err){
        console.log(err);
      });
    });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '#apply-filter', App.handleFilter);
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('click', '.btn-upload', App.addPet);
    $(document).on('click', '.btn-return', App.handleReturn);
  },

  markAdopted: async function() {
    await App.markVote();
    var faucetInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Faucet.deployed().then(function (instance) {
        faucetInstance = instance;
        return faucetInstance.getAdopters.call();
      }).then(async function(adopters) {
        console.log(adopters);
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] != '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('.btn-adopt').text('Adopted').attr('disabled', true);
            var adopted = await faucetInstance.is_adopted.call(i, {from: account});
            if (adopted == 1){
              $('.panel-pet').eq(i).find('.btn-return').show();
            } else {
              $('.panel-pet').eq(i).find('.btn-return').hide();
            }
          } else {
            $('.panel-pet').eq(i).find('.btn-adopt').text('Adopt').attr('disabled', false);
            $('.panel-pet').eq(i).find('.btn-return').hide();
          }
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var faucetInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Faucet.deployed().then(function(instance) {
        faucetInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return faucetInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleFilter: function(event) {
    event.preventDefault();
    var adopted = $('#select-adopted').val();
    var breed = $('#select-breed').val();
    var age = $('#select-age').val();
    var location = $('#select-location').val();
    var ownByMe = $('#select-own').val();
    var faucetInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.Faucet.deployed().then(function(instance){
        faucetInstance = instance;
        return faucetInstance.filter_pets.call(Adoption[adopted], Age[age], Breed[breed], Provinces[location], Own[ownByMe], {from: account});
      }).then(function (data){
        for (i = 0; i < data.length; i++) {
          if (data[i]){
            $('div[class="col-sm-6 col-md-4 col-lg-3"]').eq(i).show();
          } else {
            $('div[class="col-sm-6 col-md-4 col-lg-3"]').eq(i).hide();
          }
        }
      });
    });
  },

  handleReturn: function(event){
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    console.log($(event.target).data('id'));

    var faucetInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Faucet.deployed().then(function(instance) {
        faucetInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return faucetInstance.return_pet(petId, {value: web3.toWei("1","ether")});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();

    function wait(time) {
      return new Promise(resolve => {
          setTimeout(resolve, time);
      });
    }
    async function marks() {
      App.markVote();
      await wait(500);
      App.markAdopted();
    }
    setInterval( marks, 2000 );
    // window.setInterval(App.markVote, 5000);
  });
});
