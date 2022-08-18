import React, { Component } from 'react';
import Web3 from 'web3';
import HarvestArt from '../abis/HarvestArt.json';
import "./App.css";

class MintingForm extends Component{
    async componentWillMount() { 
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        const networkId = await web3.eth.net.getId()
        const contractAddr = await HarvestArt.networks[networkId].address;
        const marketing = web3.eth.Contract(HarvestArt.abi, contractAddr)   
        
        this.setState({ marketing })
        this.getPromissoryList()
        this.setState({ loading:false, marketingAddr:contractAddr });

    }

    constructor(props) {
        super(props);
        this.state = {
            marketingAddr:null,
            account:null,
            loading:true,
            transectionsList:[]
        };
    }

    ERC721 = (address) => {
        const web3 = window.web3
        const abi = require('../abis/ERC721.json');
        return new web3.eth.Contract(abi, address); 
    }

    ERC1155 = (address) => {
        const web3 = window.web3
        const abi = require('../abis/ERC1155.json');
        return new web3.eth.Contract(abi, address); 
    }

    approveForAll = async(e) => {
        e.preventDefault();
        const web3 = window.web3
        const thisss = this;
        this.setState({ loading: true })

        const type = e.target.type.value
        const address = e.target.address.value
        
        if(type == "ERC721"){
            this.ERC721(address).methods.setApprovalForAll(this.state.marketingAddr, true).send({ from: this.state.account }).on('transactionHash', (transactionHash) => {
                thisss.waitForReceipt(transactionHash, function (response) {
                    if(response.status){ 
                        alert("Set Approve for all Successfully");
                        thisss.setState({ loading: false});
                    }else{
                        alert(response.msg);
                        thisss.setState({ loading: false});
                    }
                });
            }).on('error', function(error, receipt) {
                alert(error.message);
                thisss.setState({ loading: false});
            });

        }else if(type == "ERC1155"){
            this.ERC1155(address).methods.setApprovalForAll(this.state.marketingAddr, true).send({ from: this.state.account }).on('transactionHash', (transactionHash) => {
                thisss.waitForReceipt(transactionHash, function (response) {
                    if(response.status){ 
                        alert("Set Approve for all Successfully");
                        thisss.setState({ loading: false});
                    }else{
                        alert(response.msg);
                        thisss.setState({ loading: false});
                    }
                });
            }).on('error', function(error, receipt) {
                alert(error.message);
                thisss.setState({ loading: false});
            });
        }


    }

    gauranteeTransfer = async(e) => {
        e.preventDefault();
        const web3 = window.web3
        const thisss = this;
        this.setState({ loading: true })

        const address = e.target.address.value
        const tokenId = e.target.tokenId.value

        const guaranteeFee = await this.state.marketing.methods.guaranteeFee().call();

        this.state.marketing.methods.gauranteeTransfer(address, tokenId).send({ from: this.state.account, value: Number(guaranteeFee) }).on('transactionHash', (transactionHash) => {
            thisss.waitForReceipt(transactionHash, function (response) {
                if(response.status){ 
                    thisss.getPromissoryList()
                    alert("Nft tranfer successfully");
                }else{
                    alert(response.msg);
                    thisss.setState({ loading: false});
                }
            });
        }).on('error', function(error, receipt) {
            alert(error.message);
            thisss.setState({ loading: false});
        });
    }

    setGuaranteeFee = async(e) => {
        e.preventDefault();
        const web3 = window.web3
        const thisss = this;
        this.setState({ loading: true })

        const fees = Number(e.target.guaranteeFee.value)*10**9

        this.state.marketing.methods.setGuaranteeFee(fees).send({ from: this.state.account}).on('transactionHash', (transactionHash) => {
            thisss.waitForReceipt(transactionHash, function (response) {
                if(response.status){ 
                    alert("Guarantee Fee set successfully");
                    thisss.setState({ loading: false});
                }else{
                    alert(response.msg);
                    thisss.setState({ loading: false});
                }
            });
        }).on('error', function(error, receipt) {
            alert(error.message);
            thisss.setState({ loading: false});
        });
    }
    
    getPromissoryList = async() => {
        const totalSupply = await this.state.marketing.methods.getGuarantees().call();
        
        // let debtList = [];
        // for (let i =0; i < totalSupply.length; i++) {
        //         console.log(totalSupply[i].tokenId);
        // //     const totalSupply = await this.state.marketing.methods.loanIdToLoan(i).call();
        // //     const tokenURI = await this.state.marketing.methods.tokenURI(i).call();
        // //     const metadata = await (await fetch(String(tokenURI))).json();
        // //     totalSupply.image = metadata.image;
        // //     debtList.push(totalSupply);
        // }
        
        this.setState({ transectionsList:totalSupply,loading:false });
    }

    async waitForReceipt(hash, cb) {
        const web3 = window.web3;
        const thiss = this;
        web3.eth.getTransactionReceipt(hash, function (err, receipt) {
            if (err) {
              console.log(err);
            }  
        
            if (receipt !== null) {
              if (cb) {
                  if(receipt.status == '0x0') {
                      cb({status:false, msg: "The contract execution was not successful, check your transaction !"});
                  } else {
                      cb({status:true, msg:"Execution worked fine!"});
                  }
              }
            } else {
              window.setTimeout(function () {
                thiss.waitForReceipt(hash, cb);
              }, 1000);
            }
        });
    }


    render() { 
        return (
            <> 
                <div className="container">
                    <div className="create_market_form card p-5">
                        <h3 className='text-center'>Set Guarantee Fee</h3>
                        <br/>
                        <form method='POST' action='#' onSubmit={this.setGuaranteeFee}>
                            <div className="form-group">
                                <label>Fees</label>
                                <input type="number" name="guaranteeFee" className="form-control" placeholder="Fees" required />
                            </div>
                            <div className="form-group">
                                <button type="submit" name="submit" className='btn btn-primary'>Submit</button>
                            </div>

                        </form>
                    </div>

                    <div className="create_market_form card p-5">
                        <h3 className='text-center'>Set Approval For All</h3>
                        <br/>
                        <form method='POST' action='#' onSubmit={this.approveForAll}>
                            <div className="form-group">
                                <label>Collection Type</label>
                                <select className='form-control' name='type'>
                                    <option value="ERC721">ERC721</option>
                                    <option value="ERC1155">ERC1155</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Collection Address</label>
                                <input type="text" name="address" className="form-control" placeholder="Collection Address" required />
                            </div>
                            <div className="form-group">
                                <button type="submit" name="submit" className='btn btn-primary'>Submit</button>
                            </div>

                        </form>
                    </div>

                    <div className="create_market_form card p-5">
                        <h3 className='text-center'>Gaurantee Transfer</h3>
                        <br/>
                        <form method='POST' action='#' onSubmit={this.gauranteeTransfer}>
                            <div className="form-group">
                                <label>Collection Address</label>
                                <input type="text" name="address" className="form-control" placeholder="Collection Address" required />
                            </div>
                            <div className="form-group">
                                <label>TokenId</label>
                                <input type="number" name="tokenId" className="form-control" placeholder="Token ID" required/>
                            </div>
                            <div className="form-group">
                                <button type="submit" name="submit" className='btn btn-primary'>Submit</button>
                            </div>

                        </form>
                    </div>
                    
                    <div className="create_market_form card p-5">
                        <h3 className='text-center'>Gaurantee Transfered List</h3>

                        {(this.state.transectionsList.length > 0) && (
                            <div className='row'>
                                {
                                    ( this.state.transectionsList.map((e,i) => (
                                        <div className='col-sm-12' key={i+"lists"}>
                                            <div className='card p-3'>
                                                <ul>
                                                    <li>Collection Address : {(e.contractAddress).toString()}</li>
                                                    <li>Token Id : {(e.tokenId).toString()}</li>
                                                    <li>Sender : {(e.senderAddress).toString()}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )))
                                }
                            </div>
                        )}

                    </div>
                    
                    { this.state.loading && 
                        <div className='loaderScreen'>
                            <div className="loader"></div>
                        </div>
                    }

                </div>
            </>
        )
    }


}

export default MintingForm;