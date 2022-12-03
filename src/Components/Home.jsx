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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const landContractAddress = "0xAA0fAFaB7B1c357186c0923061c2b42813c68aac";
const lordContractAddress = "0xe94f3Ea3b4b540F6c63993c4eB30D223e7572582";
const rentalContractAddress = "0xFf2aFcf79BfDEA66103c7ceE51B1EBe0BCcbfA54";

export const Home = () => {
    const [msg, setMsg] = useState('');
    const [land, setLand] = useState('');
    const [lord, setLord] = useState('');
    const [landApproved, setLandApproved] = useState(false);
    const [lordApproved, setLordApproved] = useState(false);
    const [reward, setReward] = useState(0);
    const [poolId, setPoolId] = useState('');
    const [rewardId, setRewardId] = useState('');
    const [landLord, setLandLord] = useState('');
    const [currentAccount, setCurrentAccount] = useState(null);
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const { chain } = useNetwork();
    const { chains, switchNetwork } = useSwitchNetwork();
    const { disconnect } = useDisconnect();
  
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
        setMsg("LOL MESSAGE: Enter Land Id and Lord Id both to be Staked")
      }
    }

    const handleUnstake = async () => {
      if (land === '' && lord === '') {
        let owner = await rentalContract.withdrawLandLords(Number(rewardId)).catch((err)=>{
          return console.log(err)
        })
      } else {
        setMsg("LOL MESSAGE: Enter Land Id and Lord Id both to be Staked")
      }
    }

    useEffect(() => {
      if (!isConnected) return;
      if (chains.find((x) => x.id === chain?.id) > 0) return;
      switchNetwork && switchNetwork(80001);
    }, [chain?.id, chains, isConnected, switchNetwork]);

    useEffect(()=> {
      const interval = setInterval( async () => {
        if (address && (landApproved === false) && (lordApproved === false)) {
          const landApproval = await lordContract.isApprovedForAll(address, rentalContractAddress).catch((err)=>{
            return console.log(err)})
          setLandApproved(landApproval)
          const lordApproval = await lordContract.isApprovedForAll(address, rentalContractAddress).catch((err)=>{
            return console.log(err)})
          setLordApproved(lordApproval)
        }

        const rewardId = await rentalContract.getUserRewardId(address).catch((err)=>{
          return console.log(err)
        })
        if (rewardId != []) {
          setRewardId(rewardId[0])
          const landLordInfo = await rentalContract.getLandLordsInfo(Number(rewardId)).catch((err)=>{
            return console.log(err)
          })
          setLandLord(landLordInfo)

          const rewardInfo = await rentalContract.getcalculateRewards(Number(rewardId)).catch((err)=>{
            return console.log(err)
          })
          setReward(rewardInfo[0])
        }
        
        }, 5000);
      return () => clearInterval(interval);}
    );
      

    return (
      <Container style={{marginTop: '3%'}}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
              <Grid item sm={10}>
                <Item>
                    <h1 style={{color:"#000"}}>Lords of the Lands Rental Dashboard</h1>
                    {isConnected ? disconnectWalletButton() : connectWalletButton()} <br/>
                  {(landApproved === false) ? <Button color="secondary" onClick={()=>{approveLand();}}>Approve Lands</Button> : <></>}
                  {(lordApproved === false) ?<Button color="secondary" onClick={()=>{approveLord();}}>Approve Lords</Button> : <></> }
                  <br/>
                  {(landApproved === false && landApproved === false) ? <>You need to approve Lands and Lords to transfer to rental contract before staking</> : <></>}
                </Item>
              </Grid>
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
              <Grid item sm={10}>
                  <Item>
                    <TextField type="number" style={{margin:'1%'}} size="small" label={'Enter Land Id'} id="Reward" value={land} onChange={(event)=>{handleLandChange(event)}}/>
                    <TextField type="number" style={{margin:'1%'}} size="small" label={'Enter Lord Id'} id="Reward" value={lord} onChange={(event)=>{handleLordChange(event)}}/> <br/>
                    
                    {(landApproved === false && landApproved === false) ? <Button disabled variant="contained" style={{margin:'1%'}}>Stake</Button> : <Button variant="contained" style={{margin:'1%'}} onClick={()=>{handleStake();}}>Stake</Button>}
                  </Item>
              </Grid>
              <Grid item sm={10}>
                  <Item>
                      <h1>Staking Dashboard</h1>
                      <h2>Items Staked</h2>
                      {((landLord === '') ? <>
                        <p>None</p>
                      </> : <>
                        <p>LandId {Number(landLord.landId)}, LordId: {Number(landLord.landId)}</p>
                        <Button style={{marginLeft:'1%'}} variant="contained" color="error" onClick={()=>{handleUnstake()}}>Unstake</Button>
                      </>)}
                      <h2>Claimable Rewards</h2>
                      <TextField size="small" disabled label={(Number(reward)/10**18).toPrecision(6) + ' ETH'} id="Reward" />
                      <Button style={{marginLeft:'1%'}} variant="contained" color="success">Claim Reward</Button>
                  </Item>
              </Grid>
              {(msg === '')?<></> : <><Grid item sm={12}><Item><h3 style={{color:"lightBlue"}}>{msg}</h3></Item></Grid></>}
            </Grid>
          </Box>
        </Container>
    )
}