import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

// Serialize with a clean `id` string (the frontend uses `product.id`),
// and hide the Mongo internal `__v` field.
ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret.id ?? ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export default mongoose.model('Product', ProductSchema);
