import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  token: null,

  // Login extras (loading + error)
  loading: false,
  error: null,

  // Artist Registration extras
  registrationLoading: false,
  registrationError: null,
  registrationSuccess: false,

  // Organisation Registration extras
  organisationRegistrationLoading: false,
  organisationRegistrationError: null,
  organisationRegistrationSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    // =========================================
    // 🔥 LOGIN START (UI → Saga)
    // =========================================
    login_Request(state, action) {
      state.loading = true;
      state.error = null;
    },

    // =========================================
    // 🔥 LOGIN SUCCESS (Saga → Redux)
    // =========================================
    login_Success(state, action) {
      const payload = action.payload ?? null;

      state.loading = false;
      state.error = null;

      // Already existing fields
      state.data = payload;
      state.token = payload?.token ?? null;
    },

    // =========================================
    // 🔥 LOGIN FAILED
    // =========================================
    login_Failed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // =========================================
    // ⭐ YOUR ORIGINAL FUNCTIONS (unchanged)
    // =========================================
    setCredentials(state, action) {
      const payload = action.payload ?? null;
      state.data = payload;
      state.token = payload?.token ?? null;
    },

    clearCredentials(state) {
      state.data = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },

    // =========================================
    // 🔥 ARTIST REGISTRATION START (UI → Saga)
    // =========================================
    artistRegistration_Request(state, action) {
      state.registrationLoading = true;
      state.registrationError = null;
      state.registrationSuccess = false;
    },

    // =========================================
    // 🔥 ARTIST REGISTRATION SUCCESS (Saga → Redux)
    // =========================================
    artistRegistration_Success(state, action) {
      state.registrationLoading = false;
      state.registrationError = null;
      state.registrationSuccess = true;
    },

    // =========================================
    // 🔥 ARTIST REGISTRATION FAILED
    // =========================================
    artistRegistration_Failed(state, action) {
      state.registrationLoading = false;
      state.registrationError = action.payload;
      state.registrationSuccess = false;
    },

    // =========================================
    // 🔥 CLEAR REGISTRATION STATE
    // =========================================
    clearRegistrationState(state) {
      state.registrationLoading = false;
      state.registrationError = null;
      state.registrationSuccess = false;
    },

    // =========================================
    // 🔥 ORGANISATION REGISTRATION START (UI → Saga)
    // =========================================
    organisationRegistration_Request(state, action) {
      state.organisationRegistrationLoading = true;
      state.organisationRegistrationError = null;
      state.organisationRegistrationSuccess = false;
    },

    // =========================================
    // 🔥 ORGANISATION REGISTRATION SUCCESS (Saga → Redux)
    // =========================================
    organisationRegistration_Success(state, action) {
      state.organisationRegistrationLoading = false;
      state.organisationRegistrationError = null;
      state.organisationRegistrationSuccess = true;
    },

    // =========================================
    // 🔥 ORGANISATION REGISTRATION FAILED
    // =========================================
    organisationRegistration_Failed(state, action) {
      state.organisationRegistrationLoading = false;
      state.organisationRegistrationError = action.payload;
      state.organisationRegistrationSuccess = false;
    },

    // =========================================
    // 🔥 CLEAR ORGANISATION REGISTRATION STATE
    // =========================================
    clearOrganisationRegistrationState(state) {
      state.organisationRegistrationLoading = false;
      state.organisationRegistrationError = null;
      state.organisationRegistrationSuccess = false;
    },
  },
});

export const {
  login_Request,
  login_Success,
  login_Failed,
  setCredentials,
  clearCredentials,
  artistRegistration_Request,
  artistRegistration_Success,
  artistRegistration_Failed,
  clearRegistrationState,
  organisationRegistration_Request,
  organisationRegistration_Success,
  organisationRegistration_Failed,
  clearOrganisationRegistrationState,
} = authSlice.actions;

export default authSlice.reducer;
