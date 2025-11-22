'use client';

import { useState, useEffect } from 'react';
import { GeolocationState, Location } from '../types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  immediate?: boolean;
}

/**
 * Custom hook to handle browser geolocation
 * @param options Geolocation options
 * @returns Geolocation state and control functions
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
    immediate = true
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: immediate,
    permission: null
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const handleSuccess = (position: GeolocationPosition) => {
    setState({
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      error: null,
      loading: false,
      permission: 'granted'
    });
  };

  const handleError = (error: GeolocationPositionError) => {
    let errorMessage = 'Gagal mendapatkan lokasi';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.';
        setState(prev => ({ ...prev, permission: 'denied' }));
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Informasi lokasi tidak tersedia.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Waktu permintaan lokasi habis.';
        break;
    }

    setState({
      location: null,
      error: errorMessage,
      loading: false,
      permission: error.code === error.PERMISSION_DENIED ? 'denied' : state.permission
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation tidak didukung oleh browser Anda.',
        loading: false,
        permission: null
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    if (watch) {
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
      setWatchId(id);
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    }
  };

  const clearWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const resetLocation = () => {
    clearWatch();
    setState({
      location: null,
      error: null,
      loading: false,
      permission: null
    });
  };

  // Check permission status if available
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permission: result.state as 'granted' | 'denied' | 'prompt' }));

        result.addEventListener('change', () => {
          setState(prev => ({ ...prev, permission: result.state as 'granted' | 'denied' | 'prompt' }));
        });
      });
    }
  }, []);

  // Get location immediately if requested
  useEffect(() => {
    if (immediate) {
      getLocation();
    }

    return () => {
      clearWatch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    ...state,
    getLocation,
    clearWatch,
    resetLocation
  };
}
