import mongoose from 'mongoose';

export interface ICounterModel extends mongoose.Document {
  _id: any;
  seq: number;
}

const Schema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.Mixed, required: true },
    seq: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    collection: 'Counter',
  },
);

const CounterModel = mongoose.model<ICounterModel>('Counter', Schema);

class Counter extends CounterModel {
  static async getNextId(_id: any) {
    const response = await this.findByIdAndUpdate(
      { _id },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return response.seq;
  }
}

export default Counter;
