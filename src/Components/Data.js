import { Alchemy, Network } from "alchemy-sdk";
import {landContractAddress, lordContractAddress} from './Home';

const config = {
    apiKey: "WYMOWU7-dcSmZGlHOMwdgJHm8-MpyMx6",
    network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(config);

export const getNFTs = async (address) => {
  // Get all NFTs
  const nfts = await alchemy.nft.getNftsForOwner(address);
  // Print NFTs
  const allNfts = nfts.ownedNfts;
  const lands = []
  const landsCategory = []
  const lords = []
  const lordsCategory = []

  for (const nft in allNfts) {
    const contractAdd = allNfts[nft].contract.address
    // console.log(contractAdd)
    if (contractAdd === landContractAddress) {
      
        lands.push(parseInt(allNfts[nft].tokenId))
        landsCategory.push((parseInt(allNfts[nft].tokenId))%3 +1)
    } else if (contractAdd === lordContractAddress) {
        lords.push(parseInt(allNfts[nft].tokenId))
        lordsCategory.push((parseInt(allNfts[nft].tokenId))%3 +1)
    }
  }
  // console.log([lands,landsCategory,lords,lordsCategory]) 
  return [lands,landsCategory,lords,lordsCategory]
};
