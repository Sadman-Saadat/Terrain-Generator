import {Camera, Mesh, Scene, TextureLoader, Vector3} from "three";
import {TerrainChunk} from "./TerrainChunk";

export class ChunkPosition{
    private readonly _chunk_x: number;
    private readonly _chunk_z: number;


    constructor(chunk_x: number, chunk_z: number) {
        this._chunk_x = chunk_x;
        this._chunk_z = chunk_z;
    }

    get chunk_x(): number {
        return this._chunk_x;
    }

    get chunk_z(): number {
        return this._chunk_z;
    }
}

class ChunkRecord{
    private readonly _position_key:string;
    private readonly _plane: Mesh;

    constructor(position: ChunkPosition, plane: Mesh) {
        this._position_key = ChunkRecord.positionToKey(position);
        this._plane = plane;
    }


    get plane(): Mesh {
        return this._plane;
    }

    get positionKey():string{
        return this._position_key;
    }


     private static positionToKey(position: ChunkPosition):string{
        return  ''+position.chunk_x+','+position.chunk_z;
    }


    containsPosition (position: ChunkPosition) : boolean{
        const key = ChunkRecord.positionToKey(position);
        return key===this._position_key;
    }

}

class ChunkRecordList{
    _chunkRecords_dp: any = {};

    add(chunkRecord : ChunkRecord){
        this._chunkRecords_dp[chunkRecord.positionKey] = chunkRecord;
    }

    remove(chunkRecord:ChunkRecord){
        delete this._chunkRecords_dp[chunkRecord.positionKey];
    }


    contains(position : ChunkPosition) :boolean{
       return  this._chunkRecords_dp[ChunkRecordList.positionToKey(position)] !== undefined;
    }

    private static positionToKey(position: ChunkPosition):string{
        return  ''+position.chunk_x+','+position.chunk_z;
    }



}







export default class TerrainChunkManager {
    _scene: Scene;

    _camera: Camera;

    SIZE = 512;

    _loader: TextureLoader = new TextureLoader();

    _chunk_records: ChunkRecord[] = [];
    _chunk_record_list = new ChunkRecordList();


    private _terrainChunk: TerrainChunk;


    constructor(scene: Scene, camera: Camera) {

        this._scene = scene;
        this._terrainChunk = new TerrainChunk(this._scene, this._loader, this.SIZE);
        this._init();
        this._camera = camera;

    }

    public checkCameraAndAddTerrain() {
        const camera = this._camera;
        const newChunkPosition = this._coordinateToChunkPosition(camera.position);
        let chunkAlreadyExists = false;
        // this._chunk_records.forEach((record) => {
        //         chunkAlreadyExists ||= record.containsPosition(newChunkPosition);
        //
        // })
        if (!this._chunk_record_list.contains(newChunkPosition)) {
            this.createChunk(newChunkPosition);
        }
        chunkAlreadyExists = false;


    }


    _coordinateToChunkPosition(position: Vector3) : ChunkPosition {
        let x = Math.floor(position.x / this.SIZE);
        let z = Math.floor(position.z / this.SIZE);
        return new ChunkPosition(x,z);
    }


    _init = () => {
        const position = new ChunkPosition(0,0);
        const plane =  this._terrainChunk.generateTerrain(position);
        this._chunk_record_list.add(new ChunkRecord(position,plane));

    }


    private createChunk(position: ChunkPosition) {
        console.log("Generate New Chunk");

        const plane = this._terrainChunk.generateTerrain(position);
        this._chunk_record_list.add(new ChunkRecord(position,plane));
    }
}