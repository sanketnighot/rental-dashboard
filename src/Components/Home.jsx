import React, {useState, useEffect} from 'react'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import {Button, Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import {  useAccount, useContract, useSigner, useNetwork, useConnect, useDisconnect, useSwitchNetwork } from 'wagmi'
import { rental_abi, land_abi, lord_abi } from "../Contracts/abi";
import Logo from '../Images/logo.png'
import Land from '../Images/land.png'
import Lord from '../Images/lord.jpg'
import Stack from '@mui/material/Stack';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode !== 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const landContractAddress = "0x994dDB18BeD59E0e6793714451197025F7382a23";
const lordContractAddress = "0xAAB842eD82b9b1bB42AAbE4F3589CA3Be45f5cA7";
const rentalContractAddress = "0x4C64b2b2295f538d64464e304d196f99BbFf7cf5";

export const Home = () => {
    const [land, setLand] = useState('');
    const [lord, setLord] = useState('');
    const [landApproved, setLandApproved] = useState(false);
    const [lordApproved, setLordApproved] = useState(false);
    const [reward, setReward] = useState(0);
    const [poolId, setPoolId] = useState('');
    const [rewardId, setRewardId] = useState([]);
    const [landLord, setLandLord] = useState([]);
    const [currentAccount, setCurrentAccount] = useState(null);
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const { chain } = useNetwork();
    const { chains, switchNetwork } = useSwitchNetwork();
    const { disconnect } = useDisconnect();
    var lalodatas = [
      {
        landId: 1,
        lordId: 1
      },
      {
        landId: 2,
        lordId: 2
      },
      {
        landId: 3,
        lordId: 3
      },
      {
        landId: 4,
        lordId: 4
      },
    ]
    const connectWalletButton = () => {
      return (
        <>
        {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => {
              if (connector.ready) {
                connect({ connector })
              } else {
                alert("To connect using metamask \n 1. Open this website in metamask mobile app \n 2. Click Wallet Connect below and select Metamask")
              }
            }
          }
        >
          <Typography variant="button" color="darkOrange">
          Connect {connector.name}
            {!connector.ready && ' (Open in Metamask Browser or click Wallet Connect below)'}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              ' (connecting)'}
          </Typography>
        </Button>
        
        ))}
        </>
      );
    };

    const disconnectWalletButton = () => {
      return (
        <>
        Connected as: {(address)} <br/>
        <Button
          onClick={() => {
              disconnect();
            }
          }
        >
          <Typography variant="button" color="red">
            Disconnect
          </Typography>
        </Button>
        </>
      );
    };

    const handleLandChange = (event) => {
      setLand(parseInt(event.target.value));
      
    };

    const handleLordChange = (event) => {
      setLord(parseInt(event.target.value));
    };

    const landContract = useContract({
      address: landContractAddress,
      abi: land_abi,
      signerOrProvider: signer,
    });

    const lordContract = useContract({
      address: lordContractAddress,
      abi: lord_abi,
      signerOrProvider: signer,
    });

    const rentalContract = useContract({
      address: rentalContractAddress,
      abi: rental_abi,
      signerOrProvider: signer,
    });

    const approveLand = async () => {
      let approve = await landContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
        return console.log(err)})
      await approve.wait(1).then(()=>{
        setLandApproved(true);
      }).catch((err)=>{
        return console.log(err)})
    }

    const approveLord = async () => {
      let approve = await lordContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
        return console.log(err)})
      await approve.wait(1).then(()=>{
        setLordApproved(true);
      }).catch((err)=>{
        return console.log(err)})
    }

    const handleStake = async () => {
      if (land != '' && lord != '') {
        let owner = await rentalContract.depositLandLords([land], lord, [1], 1).catch((err)=>{
          return console.log(err)
        })
      } else {
        alert("Enter Land Id and Lord Id both to be Staked")
      }
    }

    const handleUnstake = async (id) => {
        let owner = await rentalContract.withdrawLandLords(id).catch((err)=>{
          return console.log(err)
        })
    }

    const handleClaimRewards = async (id) => {
        let owner = await rentalContract.claimRewards(id).catch((err)=>{
          return console.log(err)
        })
    }

    useEffect(() => {
      if (!isConnected) return;
      if (chains.find((x) => x.id === chain?.id) > 0) return;
      switchNetwork && switchNetwork(80001);
    }, [chain?.id, chains, isConnected, switchNetwork]);

    useEffect(()=> {
      const interval = setInterval( async () => {
        if (address) {
          const landApproval = await lordContract.isApprovedForAll(address, rentalContractAddress).catch((err)=>{
            return console.log(err)})
          setLandApproved(landApproval)
          const lordApproval = await lordContract.isApprovedForAll(address, rentalContractAddress).catch((err)=>{
            return console.log(err)})
          setLordApproved(lordApproval)
        }

        const rewardIdInfo = await rentalContract.getUserRewardId(address).catch((err)=>{
          return console.log(err)
        })
        setRewardId((rewardIdInfo).map(Number))
        const lalo = [...landLord]
        rewardId.map(async(ll)=>{
          var lld = await rentalContract.getLandLordsInfo(ll).catch((err)=>{
                return console.log(err)
              })
          if(landLord.some(ll => ll.lordId !== lld.lordId)){
            return
          } else{
            let asd = Object.assign({selected: false}, lld);            
            asd.rewardId = ll
            lalo.push(asd)
          }
        })
        setLandLord(lalo)
        // if (Number(rewardIdInfo) > 0) {
          
        //   const landLordInfo = await rentalContract.getLandLordsInfo(Number(rewardIdInfo[0])).catch((err)=>{
        //     return console.log(err)
        //   })
        //   setLandLord(landLordInfo)
        //   const rewardInfo = await rentalContract.getcalculateRewards(5).catch((err)=>{
        //     return console.log(err)
        //   })
        //   setReward(rewardInfo[0])
        // }
        
        }, 5000);
      return () => clearInterval(interval);}
    );

    const LandLordComp = (props) => {
      return(
        <Grid item sm={10} key = {(props.item.lordId).toString()}>
          <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
            <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={0.5}>
              <div style={{backgroundColor:"transparent", color:"white"}}>
                <b>Lord ID</b><br/>
                {Number(props.item.lordId)}
              </div>
              <div style={{backgroundColor:"transparent", color:"white"}}>
                <b>Land ID</b><br/>
                {Number(props.item.landId[0])}
              </div>
              <div style={{backgroundColor:"transparent", color:"white"}}>
                <Button style={{margin:"1%"}} color="error" fullWidth variant="contained" onClick={()=>{handleUnstake(props.item.rewardId)}}>UnStake</Button>
                <Button style={{margin:"1%"}} color="success" fullWidth variant="contained" onClick={()=>{handleClaimRewards(props.item.rewardId)}}>Claim Reward</Button>
              </div>
            </Stack>
          </Item>
        </Grid>
     )
    } 

    return (
      <Container>
          <Box sx={{ flexGrow: 1 }} style={{height: '100vh', overflow: 'scroll'}}>
            <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
              <Grid item sm={10} style={{marginTop: '1%'}}>
                <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
                    <img alt="" src={Logo} style={{width:'30%', marginTop: '1%'}}/>
                    <h1 style={{color:"#ffffff"}}>RENTAL DASHBOARD</h1>
                    {isConnected ? disconnectWalletButton() : connectWalletButton()} <br/>
                </Item>
              </Grid>
              {(landApproved === false || landApproved === false) ?
              <Grid item sm={10}>
                <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
                   <h3>You need to approve Lands and Lords to transfer to rental contract before staking</h3>
                  {(landApproved === false) ? <Button color="primary" variant="contained" style={{margin:'1%'}} onClick={()=>{approveLand();}}>Approve Lands</Button> : <></>}
                  {(lordApproved === false) ?<Button color="primary" variant="contained" style={{margin:'1%'}} onClick={()=>{approveLord();}}>Approve Lords</Button> : <></> }
                  <br/>
                </Item> 
              </Grid>: <></>}
              {/* <Grid item sm={6}>
                  <Item>
                      <h2>Lords You Own</h2>
                      <Box sx={{ minWidth: 120 }} style={{ marginTop : '1%'}}>
                          <FormControl fullWidth>
                              <InputLabel id="Select Lord">Select Lord</InputLabel>
                              <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={lord}
                              label="Lord"
                              onChange={handleLordChange}
                              >
                              <MenuItem value={"Lord 1"}>Lord 1</MenuItem>
                              <MenuItem value={"Lord 2"}>Lord 2</MenuItem>
                              <MenuItem value={"Lord 3"}>Lord 3</MenuItem>
                              </Select>
                          </FormControl>
                      </Box>
                      <Button variant="text">Mint New Lord</Button>
                  </Item>
              </Grid>
              <Grid item sm={6}>
                  <Item>
                      <h2>Lands You Own</h2>
                      <Box sx={{ minWidth: 120 }} style={{ marginTop : '1%'}}>
                          <FormControl fullWidth>
                              <InputLabel id="Select Land">Select Land</InputLabel>
                              <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={land}
                              label="Land"
                              onChange={handleLandChange}
                              >
                              <MenuItem value={"Land 1"}>Land 1</MenuItem>
                              <MenuItem value={"Land 2"}>Land 2</MenuItem>
                              <MenuItem value={"Land 3"}>Land 3</MenuItem>
                              </Select>
                          </FormControl>
                      </Box>
                      <Button variant="text">Mint New Land</Button>
                  </Item>
                  
              </Grid> */}
              <Grid item sm={5}>
                  <Item style={{backgroundColor:"#041E2F"}}>
                    <img alt="" src={Lord} style={{width:'20%', marginTop: '1%'}}/>
                    <TextField fullWidth sx={{ input: { color: 'white' } }} variant="standard" InputLabelProps={{style: { color: '#fff' }}} type="number" style={{margin:'1%', color: 'white'}} size="small" label={'Enter Lord Id'} id="Reward" value={lord} onChange={(event)=>{handleLordChange(event)}}/> <br/>
                  </Item>
              </Grid>

              <Grid item sm={5}>
                  <Item style={{backgroundColor:"#041E2F"}}>
                    <img alt="" src={Land} style={{width:'20%', marginTop: '1%'}}/>
                    <TextField fullWidth sx={{ input: { color: 'white' } }} variant="standard" InputLabelProps={{style: { color: '#fff' }}} type="number" style={{margin:'1%', color: 'white'}} size="small" label={'Enter Land Id'} id="Reward" value={land} onChange={(event)=>{handleLandChange(event)}}/><br/>
                  </Item>
              </Grid> <br/>

              <Grid item sm={5}>
                  <div style={{backgroundColor:"transparent"}}>
                    {(landApproved === false && landApproved === false) ? <Button fullWidth variant="contained" 
                    onClick={()=>{
                      if(landApproved === false && lordApproved === false){alert("Approve Land and Lord to stake")}
                      else if(land === '' && lord === ''){alert("Enter Land and Lord to Stake")};
                    }}>Stake</Button> : <Button color="success" fullWidth variant="contained" onClick={()=>{handleStake();}}>Stake</Button>}
                  </div>
              </Grid><br/>           
              {/* {(landLord === []) ?  <Grid item sm={10}><br/><p style={{backgroundColor:'white', color:'red'}}>No LandLords Staked</p></Grid> 
              : landLord.map((item, index) => {
                 <LandLordComp item={item} key={index}/>
              })}  */}
              
              {landLord.map((item, index) => {
                return <LandLordComp item={item} key={index}/>
              })}

              {/* <Grid item sm={10}>
                  <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
                      <h1>Staking Dashboard</h1>
                      <h2>Items Staked</h2>
                      {((landLord === '') ? <>
                        <p>None</p>
                      </> : <>
                        {rewardId.map(async (item)=>{
                          const landlord = await getLandlord(1);
                          return (
                            <>LandId {Number(landlord.landId)}, LordId: {Number(landlord.lordId)}
                            <Button style={{marginLeft:'1%'}} variant="contained" color="error" onClick={()=>{handleUnstake()}}>Unstake</Button></>
                          )
                        })}
                        
                      </>)}
                      <h2>Claimable Rewards</h2>
                      <TextField size="small" disabled InputLabelProps={{style: { color: 'lightGrey' }}} label={(Number(reward)) + ' WEI'} id="Reward" />
                      {((landLord[8] === false) ? <>
                      <Button style={{marginLeft:'1%'}} variant="contained" disabled color="success">Claim Reward</Button>
                      </> : <>
                        <Button style={{marginLeft:'1%'}} variant="contained" color="success" onClick={()=>{handleClaimRewards()}}>Claim Reward</Button>
                      </>)}
                  </Item>
              </Grid> */}
            </Grid>
          </Box>
        </Container>
    )
}