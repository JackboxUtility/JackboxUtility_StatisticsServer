import * as mongoDB from "mongodb";
import AbstractUserStat from "../model/AbstractUserStat";

export const collections: { appOpenStats?: mongoDB.Collection } = {}
export const db: {stats?: mongoDB.Db} = {}

export async function connectToDatabase () {
    console.log("mongodb://"+process.env.MONGO_INITDB_ROOT_USERNAME+":"+process.env.MONGO_INITDB_ROOT_PASSWORD+"@mongo")
    const client: mongoDB.MongoClient = new mongoDB.MongoClient("mongodb://"+process.env.MONGO_INITDB_ROOT_USERNAME+":"+process.env.MONGO_INITDB_ROOT_PASSWORD+"@mongo");
    
    await client.connect();
    
    db.stats = client.db("STATS");
    
    console.log(`Successfully connected to database`);
}

export async function saveStatInCollection (data: AbstractUserStat) {
    const currentDb = db.stats;
    const currentcollection: mongoDB.Collection = currentDb.collection(data.getCollectionName());

    const existingData = await currentcollection.findOne({hash:data.hash});
    if(existingData){
        await currentcollection.updateOne({hash:data.hash},{"$set":data.toJson()});
    }else{
        await currentcollection.insertOne(data.toJson());
    }
}

export async function getDocumentsInCollection (collectionName: string) {
    const currentDb = db.stats;
    const currentcollection: mongoDB.Collection = currentDb.collection(collectionName);

    const cursor = currentcollection.find({});
    const result = await cursor.toArray();
    console.log(`Successfully found ${result?.length} documents`);
    return result;
}