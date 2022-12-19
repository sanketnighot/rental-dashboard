import React, {useState, useEffect} from 'react'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import {Button, Typography} from '@mui/material';
import {  useAccount, useContract, useSigner, useNetwork, useConnect, useDisconnect, useSwitchNetwork } from 'wagmi'
import { rental_abi, land_abi, lord_abi } from "../Contracts/abi";
import Logo from '../Images/logo.png'
import Land from '../Images/land.png'
import Lord from '../Images/lord.jpg'
import Stack from '@mui/material/Stack';
import {getNFTs} from './Data'
import {useSnackbar } from 'notistack';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode !== 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

export const landContractAddress = "0x379fecacf8c2a3c4b5787450217bba6865fde7fd";
export const lordContractAddress = "0xbc5c3770e76182848b2edd5ea1e74f2ce64077ee";
export const rentalContractAddress = "0x2c5dD32117E5dF2e2eBA434c16D404E3a2865849";

export const Home = () => {
    const [land, setLand] = useState([]);
    const [lord, setLord] = useState('');
    const [landcategory, setLandCategory] = useState([]);
    const [lordcategory, setLordCategory] = useState('');
    const [ownland, setOwnLand] = useState([]);
    const [ownlord, setOwnLord] = useState([]);    
    const [ownlandcategory, setOwnLandcategory] = useState([]);
    const [ownlordcategory, setOwnLordcategory] = useState([]);    
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
    const { enqueueSnackbar } = useSnackbar();

    const handleSnackbar = (variant, msg) => () => {
      // variant could be success, error, warning, info, or default
      enqueueSnackbar(msg, { variant });
    };


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

    const handleLandChange = (id) => {
      var l = [...land]
      var lc = [...landcategory]
      if (lord === '') {
        alert('Please select lord first');
      } else if (!l.includes(id) && lord%3 + 1 <= l.length || lord%3 + 2 <= l.length || lord%3 + 3 <= l.length) {
        alert('You have selected Maximum number of Lands')
      } else if (l.includes(id)) {
        l.splice(l.indexOf(id), 1);
        lc.splice(l.indexOf(id))
      } else {
        l.push(id)
        lc.push(ownlandcategory[l.indexOf(id)])
      }
      setLand(l);
      setLandCategory(lc);
    };

    const handleLordChange = (id) => {
      setLord(id);
      setLordCategory(ownlordcategory[ownlord.indexOf(id)])
      setLand([]);
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
        alert( "Lands Approved")
      }).catch((err)=>{
        return console.log(err)})
        alert( "An Error Occured, Please Try Again")
    }

    const approveLord = async () => {
      let approve = await lordContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
        return console.log(err)})
      await approve.wait(1).then(()=>{
        setLordApproved(true);
        alert( "Lords Approved")
      }).catch((err)=>{
        return console.log(err)})
        alert( "An Error Occured, Please Try Again")
    }

    const handleStake = async () => {
      console.log(land)
      console.log(landcategory)
      console.log(lord)
      console.log(lordcategory)
      if (land.length !== 0 && lord !== '') {
        let owner = await rentalContract.depositLandLords(land, lord, landcategory, lordcategory).then(()=>{
          alert( "LandLords Staked")
        }).catch((err)=>{
          alert( "An Error Occured, Please Try Again")
          return console.log(err)
        })
      } else {
        alert("Enter Land Id and Lord Id both to be Staked")
      }
    }

    const handleUnstake = async (id) => {
      console.log(id)
        let owner = await rentalContract.withdrawLandLords(id).then(()=>{
          alert( "LandLords Staked")
        }).catch((err)=>{
          alert("An Error Occured, Please Try Again")
          return console.log(err)
        })
        
    }

    const handleClaimRewards = async (id) => {
        let owner = await rentalContract.claimRewards(id).then(()=>{
          alert( "Rewards Claimed")         
        }).catch((err)=>{
          alert( "An Error Occured, Please Try Again")
          return console.log(err)
        })
    }

    useEffect(() => {
      if (!isConnected) return;
      if (chains.find((x) => x.id === chain?.id) > 0) return;
      switchNetwork && switchNetwork(5);
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
          const ownedNft = await getNFTs(address);
          setOwnLand(ownedNft[0]);
          setOwnLord(ownedNft[2]);
          setOwnLandcategory(ownedNft[1]);
          setOwnLordcategory(ownedNft[3]);
        }
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
            <Grid container spacing={2} direction="row" justifyContent="center" alignItems="flex-start">
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
              <Grid item sm={5}>
                <Item style={{backgroundColor:"#041E2F"}}>
                  <img alt="" src={Lord} style={{width:'20%', marginTop: '1%'}}/><br/>
                  {ownlord.map((item, index)=>{
                    if (lord === item) {
                      return <h2 style={{margin:'2%', padding:'1%', color:'#fff', border:'1px solid', cursor: 'pointer'}} key={index} onClick={()=>{handleLordChange(item)}}>Lord #{item} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Category #{item%3 + 1}</h2>
                    } else {
                      return <h2 style={{margin:'2%', padding:'1%', color:'#fff', cursor: 'pointer'}} key={index} onClick={()=>{handleLordChange(item)}}>Lord #{item} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Category #{item%3 + 1}</h2>
                    }

                    })
                  }
                </Item>
              </Grid>

              <Grid item sm={5}>
                  <Item style={{backgroundColor:"#041E2F"}}>
                    <img alt="" src={Land} style={{width:'20%', marginTop: '1%'}}/>
                    {ownland.map((item, index)=>{
                      if (land.includes(item)) {
                        return <h2 style={{margin:'2%', padding:'1%', color:'#fff', border:'1px solid', cursor: 'pointer'}} key={index} onClick={()=>{handleLandChange(item)}}>Land #{item} </h2>
                      } else {
                        return <h2 style={{margin:'2%', padding:'1%', color:'#fff', cursor: 'pointer'}} key={index} onClick={()=>{handleLandChange(item)}}>Land #{item} </h2>
                      }
                        
                      })
                    }
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
              
              {landLord.map((item, index) => {
                return <LandLordComp item={item} key={index}/>
              })}
            </Grid>
          </Box>
        </Container>
    )
}