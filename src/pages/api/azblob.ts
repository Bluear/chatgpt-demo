import type { APIRoute } from 'astro'
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
import { verifySignature } from '@/utils/auth'
// #vercel-disable-blocks
import { fetch, ProxyAgent } from 'undici'
import { BlobServiceClient } from '@azure/storage-blob'


// Connection string
const connString = 'DefaultEndpointsProtocol=https;AccountName=ysmedia;AccountKey=JxYBZG6Tl4YF7WKLAaaAV0bcmQBhay6bgVbbYBBcdKSjTztd+Xk3aGwQ03WpmZNaDOMXGJsiEse3njCXLSRsyg==;EndpointSuffix=core.windows.net';
var downloadString = "https://ysmedia.blob.core.windows.net/lsp";
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// <Snippet_UploadBlob>
// containerClient: container client
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
// uploadOptions: {
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' }, 
//    tags: {project: 'xyz', owner: 'accounts-payable'} 
//  }
async function createBlobFromString(containerClient, blobName, fileContentsAsString, uploadOptions) {

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload string
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // do something with blob
  //const getTagsResponse = await blockBlobClient.getTags();
  //console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
}
// </Snippet_UploadBlob>

export function main(lspcontent) {
  try {
    console.log('START UPLOAD');
    let blobs = [];
    let result = '';

    // create container
    const timestamp = Date.now();
    const containerName = `createblobfromstring-${timestamp}`;

    const containerOptions = {
      access: 'container'
    };
    const containerClient = client.getContainerClient('lsp');
    console.log('container get succeeded' + containerClient.containerName);

    // create 10 blobs with Promise.all

    const uploadOptions = {

      metadata: {
        owner: 'YUNSTORM'
      }

    }

    blobs.push(createBlobFromString(containerClient, timestamp + ".lsp", lspcontent, uploadOptions));

    Promise.all(blobs);
    console.log('finish');
    console.log(downloadString + "/" + timestamp + ".lsp");
    result = downloadString + "/" + timestamp.toString() + ".lsp";
    return result.toString();
  }
  catch (e) {
    throw Error('Azure blob upload failed' + e);
  }
}
