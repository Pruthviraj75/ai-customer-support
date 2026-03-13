import { Connection } from "mongoose"


declare global{
    var mongoose:{
        conn:Connection | Null
        promise:Promise<Connection> | null
    }
}

export {}