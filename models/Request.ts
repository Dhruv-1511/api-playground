import mongoose, { Schema, Document, Model } from 'mongoose';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IRequestParam {
  key: string;
  value: string;
  enabled: boolean;
}

export interface IRequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface IRequest {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  params: IRequestParam[];
  headers: IRequestHeader[];
  body?: string;
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
  collectionRef?: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RequestParamSchema = new Schema<IRequestParam>(
  {
    key: { type: String, required: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const RequestHeaderSchema = new Schema<IRequestHeader>(
  {
    key: { type: String, required: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const RequestSchema = new Schema<IRequest>(
  {
    name: {
      type: String,
      required: [true, 'Request name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'GET',
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    params: [RequestParamSchema],
    headers: [RequestHeaderSchema],
    body: {
      type: String,
      default: '',
    },
    bodyType: {
      type: String,
      enum: ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw'],
      default: 'json',
    },
    collectionRef: {
      type: Schema.Types.ObjectId,
      ref: 'Collection',
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
  },
  {
    timestamps: true,
  }
);

// Indexes
RequestSchema.index({ collectionRef: 1 });
RequestSchema.index({ workspace: 1, owner: 1 });

const Request: Model<IRequest> = mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);

export default Request;
