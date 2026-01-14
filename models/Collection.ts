import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  requests: mongoose.Types.ObjectId[];
  isShared: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requests: [{
      type: Schema.Types.ObjectId,
      ref: 'Request',
    }],
    isShared: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when set
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
CollectionSchema.index({ workspace: 1, owner: 1 });
// shareToken already has an index from unique: true

const Collection: Model<ICollection> = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
