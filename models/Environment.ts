import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnvVariable {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface IEnvironment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  variables: IEnvVariable[];
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnvVariableSchema = new Schema<IEnvVariable>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      default: ''
    },
    isSecret: {
      type: Boolean,
      default: false
    },
  },
  { _id: false }
);

const EnvironmentSchema = new Schema<IEnvironment>(
  {
    name: {
      type: String,
      required: [true, 'Environment name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    variables: [EnvVariableSchema],
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
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EnvironmentSchema.index({ workspace: 1, owner: 1 });

const Environment: Model<IEnvironment> = mongoose.models.Environment || mongoose.model<IEnvironment>('Environment', EnvironmentSchema);

export default Environment;
