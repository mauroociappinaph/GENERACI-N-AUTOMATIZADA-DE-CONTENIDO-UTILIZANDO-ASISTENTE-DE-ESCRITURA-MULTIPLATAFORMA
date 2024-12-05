//Contracts Access
const contracts: {
    token: string;
    auction: string;
    collection: string;
} = { 
    token: "0x4092d0a38c83109a29fa18f98f4f6b5913692819",
    auction: '0x5978384b95bcc93673d6443d993bf1e5b1d2e561',
    collection: "0xb1a21ff46bbae820e146de9d4dcaa9ba3dcc7bd0", 
}

const chainID: {

    mainNet: string 
    testNet: string 

} = {
    mainNet: '0x2105',
    testNet: '0x2105'
}

export { 
    contracts,
    chainID
};