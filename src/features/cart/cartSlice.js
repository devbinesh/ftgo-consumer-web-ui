import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postCreateNewCart, putUpdateCartWithItem } from '../actions/api';

const ns = 'cart';

export const obtainNewCartAsyncThunk = createAsyncThunk(
  'cart/createNew',
  async (data, { rejectWithValue, dispatch }) => {
    void data;
    return postCreateNewCart();
  });

export const updateCartWithItemAsyncThunk = createAsyncThunk(
  'cart/updateCartWithItem',
  async (data, { rejectWithValue, dispatch }) => {
    const { cartId, restaurantId, itemId, qty, item } = data;
    void item;
    if (!restaurantId || !cartId || !itemId) {
      return;
    }
    return putUpdateCartWithItem(cartId, restaurantId, itemId, qty);
  });

const initialState = {
  id: null,
  status: null,
  items: [],
  hash: ''
};

export const accessCart = (propName) => ({ [ ns ]: state }) => propName ? (state?.[ propName ]) : state;
export const accessCartItems = () => ({ [ ns ]: state }) => state?.items ?? [];
export const accessCartStatus = () => ({ [ ns ]: state }) => state?.status;

export const cartSlice = createSlice({
  name: ns,
  initialState,
  reducers: {
    resetCart: () => Object.assign({}, initialState, { items: [] })
  },
  extraReducers: builder => builder
    .addCase(obtainNewCartAsyncThunk.pending, (state, { payload }) => {
      state.status = 'pending';
    })
    .addCase(obtainNewCartAsyncThunk.fulfilled,
      (state, { payload, ...rest }) => {
        return Object.assign({}, state, payload, { status: 'ready' });
      })
    .addCase(obtainNewCartAsyncThunk.rejected, (state, { payload, ...rest }) => {
      state.status = 'error';
      state.items = [];
    })
    .addCase(updateCartWithItemAsyncThunk.pending, (state, { payload, meta }) => {
      console.log(payload, meta);
      debugger;
      const { itemId, item, restaurantId, qty } = meta.arg;
      const idx = state.items.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        state.items = [
          ...state.items.slice(0, idx),
          Object.assign({}, state.items[ idx ], {
            count: state.items[ idx ].count + qty,
            oldCount: state.items[ idx ].count
          }),
          ...state.items.slice(idx + 1)
        ]; // state.items.splice(idx, 1);
      } else {
        state.items = [
          ...state.items,
          Object.assign({}, item, {
            meta: { restaurantId },
            count: qty,
            oldCount: 0
          })
        ];
      }
      state.hash = calculateHash(state.items);

    })
    .addCase(updateCartWithItemAsyncThunk.fulfilled, (state, { payload, meta }) => {
      console.log(payload, meta);
      debugger;
      const { itemId } = meta.arg;
      const idx = state.items.findIndex(item => item.id === itemId);
      if (idx < 0) {
        return;
      }

      state.items = [
        ...state.items.slice(0, idx),
        Object.assign({}, state.items[ idx ], {
          oldCount: undefined
        }),
        ...state.items.slice(idx + 1)
      ];
      state.hash = calculateHash(state.items);

    })
    .addCase(updateCartWithItemAsyncThunk.rejected, (state, { payload, meta, error }) => {
      console.log(payload, meta);
      debugger;
      const { itemId } = meta.arg;
      const idx = state.items.findIndex(item => item.id === itemId);
      if (idx < 0) {
        return;
      }

      state.items = [
        ...state.items.slice(0, idx),
        ...((state.items[ idx ].oldCount === 0) ? [] : [
          Object.assign({}, state.items[ idx ], {
            oldCount: undefined,
            count: state.items[ idx ].oldCount
          })
        ]),
        ...state.items.slice(idx + 1)
      ];
      state.hash = calculateHash(state.items);



    })
});

function calculateHash(arr) {
  return arr.map(i => [ i.id, i.count, i.oldCount ?? '' ].join('|')).join(';');
}

export const { resetCart } = cartSlice.actions;

const namedReducer = {
  [ ns ]: cartSlice.reducer
};

export default namedReducer;
