/*
User logs in → refresh token exists only as a cookie
No record in DB

Problems:
  User clicks "logout" → you clear the cookie
  BUT if someone stole the cookie before logout
  → they still have a valid refresh token
  → they can keep getting new access tokens forever
  → no way to stop them

Also:
  Token rotation reuse detection impossible
  → can't tell if old token was already used
  Logout all devices impossible
  → nothing to delete from DB
  
  
  User logs in → refresh token saved to DB

On logout
  → delete from DB
  → even if attacker has the cookie
  → /auth/refresh checks DB → token not found → rejected ✅

On token rotation
  → old token deleted from DB
  → new token saved
  → if attacker tries old token → not in DB → detected ✅
  → wipe ALL tokens for that user → forced logout everywhere ✅

On logout all devices
  → delete ALL documents where userId matches
  → every device forced out instantly ✅
  */

  import mongoose, {Document, Schema} from "mongoose";

  export interface IRefreshToken extends Document{

    userId: mongoose.Types.ObjectId //User ka unique ID (primary key)”
    token : string
    expiresAt: Date
    createdAt : Date

  }


  const refreshTokenSchema  = new Schema<IRefreshToken>({

    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true, 'userId is required'],
        index:true,
    },

     token: {
      type: String,
      required: [true, 'Token is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only need createdAt
  }
)



/*
TTL index (auto delete)

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
MongoDB ko bol raha hai:

“Jab expiresAt ka time cross ho jaye → document automatically delete kar do”
*/
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })


// ── Compound index — fast delete all tokens for a user ────────────
refreshTokenSchema.index({ userId: 1, expiresAt: 1 })

export const RefreshToken = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
)



  