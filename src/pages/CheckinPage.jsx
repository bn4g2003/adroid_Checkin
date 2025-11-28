import React, { useState, useEffect, useRef } from 'react';
import { getDb } from '../lib/firebaseClient.js';
import {
  Clock,
  Wifi,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  History,
  AlertCircle,
  Camera,
  X,
  DollarSign, // Added for check-in popup
  Award // Added for check-out popup
} from 'lucide-react';
import { useToast } from '../components/ui/useToast.js'; // Added for toast notifications
import BottomNav from '../components/employee/BottomNav.jsx';
// import { put } from '@vercel/blob'; // Temporarily disabled

export default function EmployeeCheckin() {
  const { addToast } = useToast(); // Initialize useToast
  const [employee, setEmployee] = useState({ name: '', id: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [wifiInfo, setWifiInfo] = useState({
    ssid: 'Checking...',
    available: false,
    ip: null,
    localIP: null,
    verified: false,
    connectionType: 'unknown'
  });
  const [_checkins, _setCheckins] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [_showHistory, _setShowHistory] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [db, setDb] = useState(null);
  const [companyWifis, setCompanyWifis] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({}); // { [employeeId]: { fullName, active, ... } }
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [checkInType, setCheckInType] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Firebase config is centralized in src/lib/firebaseClient.js

  // Init Firebase once
  useEffect(() => {
    initFirebase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect wifi + ip on mount
  useEffect(() => {
    detectWifiAndIP();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load employeeId and employeeName from localStorage on first load
  useEffect(() => {
    try {
      const storedId = localStorage.getItem('employeeSessionId');
      const storedName = localStorage.getItem('employeeSessionName');
      if (storedId) {
        setEmployee({ id: storedId.toUpperCase(), name: storedName || '' });
      }
    } catch { /* ignore */ }
    setLoadedFromStorage(true);
  }, []);

  // When employees list is available, auto-fill name for stored/typed ID and persist ID
  useEffect(() => {
    if (!loadedFromStorage) return;
    if (!employee.id) return;
    const emp = employeesMap[employee.id];
    if (emp && emp.fullName && emp.fullName !== employee.name) {
      setEmployee(prev => ({ ...prev, name: emp.fullName }));
    }
    // Removed localStorage.setItem('employeeId', employee.id) as it's now handled by login page
  }, [employeesMap, employee.id, loadedFromStorage]);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lng: null, address: 'Browser does not support Geolocation' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
setLocation({ lat: latitude, lng: longitude, address: 'Loading address...' });

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => setLocation(prev => ({ ...prev, address: data.display_name || 'Unknown' })))
          .catch(() => setLocation(prev => ({ ...prev, address: 'Could not retrieve address' })));
      },
      () => {
        setLocation({ lat: null, lng: null, address: 'Could not retrieve location' });
      },
      { maximumAge: 60 * 1000, timeout: 5000 }
    );
  }, []);

  // ---------- Wifi & IP detection ----------
  const detectWifiAndIP = async () => {
    try {
      setWifiInfo(prev => ({ ...prev, ssid: 'Checking IP...', verified: false }));
      let connectionType = 'unknown';
      if ('connection' in navigator) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        connectionType = conn ? (conn.effectiveType || conn.type || 'unknown') : 'unknown';
      }

      let publicIP = null;
      let localIP = null;

      const ipServices = [
        'https://api.ipify.org?format=json',
        'https://api.bigdatacloud.net/data/client-ip',
        'https://ipapi.co/json/',
        'https://api.my-ip.io/ip.json'
      ];

      for (const service of ipServices) {
        try {
          const res = await fetch(service);
          const data = await res.json();
          publicIP = data.ip || data.ipString || data.IPv4 || null;
          if (publicIP) break;
        } catch {
          // ignore
        }
      }

      try {
        localIP = await getLocalIP();
      } catch {
        localIP = null;
      }

  const matchedWifi = checkIPAgainstCompanyWifis(publicIP, localIP);

      setWifiInfo({
        ssid: matchedWifi ? matchedWifi.name : 'Unknown WiFi',
        available: !!matchedWifi,
        verified: !!matchedWifi,
        ip: publicIP || 'Not available',
        localIP: localIP,
        connectionType
      });

      if (!publicIP) {
        setStatus({ type: 'error', message: '⚠️ Could not retrieve public IP. Please check your network connection.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error detecting wifi:', error);
      setWifiInfo({
        ssid: 'Could not determine WiFi',
        available: false,
        verified: false,
        ip: 'Connection error',
        localIP: null,
        connectionType: 'unknown'
      });
    }
  };

  // Tự động re-check khi danh sách WiFi công ty được tải về
  useEffect(() => {
    if (companyWifis.length) {
      detectWifiAndIP();
    }
  }, [companyWifis]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebRTC local IP
  const getLocalIP = () => {
    return new Promise((resolve, reject) => {
      const pc = new RTCPeerConnection({ iceServers: [] });
      try {
        pc.createDataChannel('');
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(err => console.warn(err));
pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
          const match = ipRegex.exec(ice.candidate.candidate);
          if (match) {
            resolve(match[1]);
            pc.close();
          }
        };

        setTimeout(() => {
          try { pc.close(); } catch { /* ignore */ }
          reject('Timeout');
        }, 2500);
      } catch (e) {
        reject(e);
      }
    });
  };

  const checkIPAgainstCompanyWifis = (publicIP, localIP) => {
    if ((!publicIP && !localIP) || !companyWifis.length) return null;
    const getPrefix = (ip) => ip?.split('.').slice(0, 3).join('.') + '.';
    for (const wifi of companyWifis) {
      const hasPubCfg = !!wifi.publicIP;
      const hasLocalCfg = !!wifi.localIP;

      // Ưu tiên so khớp Public IP nếu được cấu hình
      if (hasPubCfg) {
        if (publicIP === wifi.publicIP) {
          return wifi;
        }
        // public không khớp thì bỏ qua WiFi này luôn, tránh match giả theo local
        continue;
      }

      // Nếu không cấu hình publicIP, cho phép so khớp theo prefix localIP
      if (hasLocalCfg) {
        if (localIP && localIP.startsWith(getPrefix(wifi.localIP))) {
          return wifi;
        }
      }
    }
    return null;
  };

  // ---------- Firebase init ----------
  const initFirebase = async () => {
    try {
      setStatus({ type: 'info', message: 'Connecting to Firebase...' });
  const dbMod = await getDb();
  const { database, ref, onValue } = dbMod;
      setDb(dbMod);
      setFirebaseConfigured(true);
      setStatus({ type: 'success', message: '✅ Firebase connected successfully!' });

      // Load checkins
      loadCheckinsFromFirebase(database, ref, onValue);
      
      // Load company WiFis
      loadCompanyWifisFromFirebase(database, ref, onValue);

  // Load employees
  loadEmployeesFromFirebase(database, ref, onValue);

      setTimeout(() => setStatus({ type: '', message: '' }), 2500);
    } catch (error) {
      console.error('Firebase error:', error);
      setStatus({ type: 'error', message: '❌ Firebase connection error: ' + (error?.message || error) });
    }
  };

  const loadCheckinsFromFirebase = (database, ref, onValue) => {
    try {
      const checkinsRef = ref(database, 'checkins');
      onValue(checkinsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arr = Object.keys(data).map(k => ({ firebaseId: k, ...data[k] }));
          arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          _setCheckins(arr);
        } else {
          _setCheckins([]);
        }
      });
    } catch (_e) {
      console.error('Load checkins error', _e);
    }
  };

  const loadCompanyWifisFromFirebase = (database, ref, onValue) => {
    try {
      const wifisRef = ref(database, 'companyWifis');
      onValue(wifisRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
          setCompanyWifis(arr);
        } else {
          setCompanyWifis([]);
        }
      });
    } catch (_e) {
      console.error('Load company WiFis error', _e);
    }
  };

  const loadEmployeesFromFirebase = (database, ref, onValue) => {
    try {
      const employeesRef = ref(database, 'employees');
      onValue(employeesRef, (snapshot) => {
        const data = snapshot.val() || {};
        setEmployeesMap(data);
      });
    } catch (_e) {
      console.error('Load employees error', _e);
    }
  };

  // ---------- Checkin flow ----------
  const handleCheckin = async (type) => {
    if (!firebaseConfigured) {
      setStatus({ type: 'error', message: '⚠️ Firebase not connected. Please wait...' });
      return;
    }
    if (!employee.name || !employee.id) {
      setStatus({ type: 'error', message: '⚠️ Please enter full employee information!' });
      return;
    }
    // Validate employee ID tồn tại và đang active
    const emp = employeesMap[employee.id];
    if (!emp) {
      setStatus({ type: 'error', message: '⚠️ Employee ID does not exist in the system.' });
      return;
    }
    if (emp.active === false) {
      setStatus({ type: 'error', message: '⚠️ Employee is Inactive, cannot check-in.' });
      return;
    }
    // Auto-fill tên chuẩn từ danh sách nếu khác
    if (emp.fullName && emp.fullName !== employee.name) {
      setEmployee(prev => ({ ...prev, name: emp.fullName }));
    }
    if (!wifiInfo.verified) {
      setStatus({ type: 'error', message: '⚠️ WiFi not verified. Please connect to company WiFi to check-in.' });
      return;
    }

    setCheckInType(type);
    setCapturedPhoto(null);
    setShowCamera(true);
    startCamera();
  };

  // Camera start/stop
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setStatus({ type: 'error', message: '❌ Cannot access camera: ' + error.message });
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      try { videoRef.current.srcObject = null; } catch { /* ignore */ }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // scale down
    const maxWidth = 800, maxHeight = 600;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const photoData = canvas.toDataURL('image/jpeg', 0.6);
    setCapturedPhoto(photoData);

    // stop camera but keep modal open so user sees capturedPhoto immediately
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const cancelCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedPhoto(null);
    setCheckInType(null);
  };

  // Confirm and save checkin:
  const confirmCheckin = async () => {
    if (!capturedPhoto) {
      setStatus({ type: 'error', message: '⚠️ Please take a photo!' });
      return;
    }
    if (!db) {
      setStatus({ type: 'error', message: '⚠️ Firebase not ready!' });
      return;
    }

          setLoading(true);
        setStatus({ type: 'info', message: '⏳ Saving...' });
    
        try {
          const timestamp = new Date().toISOString();
          const checkinData = {
            employeeId: employee.id,
            employeeName: employee.name,
            type: checkInType,
            timestamp,
            photoBase64: capturedPhoto, // tạm lưu base64 để fallback nếu cần
            location: {
              lat: location.lat,
              lng: location.lng,
              address: location.address
            },
            wifi: {
              ssid: wifiInfo.ssid,
              verified: wifiInfo.verified,
              publicIP: wifiInfo.ip,
              localIP: wifiInfo.localIP,
              connectionType: wifiInfo.connectionType
            }
          };
    
          // Destructure db object to use correct Firebase API  
          const { database, ref, push } = db;
          const checkinsRef = ref(database, 'checkins');
          
          console.log('🔥 About to save checkin data:', checkinData);
          console.log('🔥 Database ref:', checkinsRef);
          
          // push và lấy ref mới (key)
          const newRef = await push(checkinsRef, checkinData);
          const newKey = newRef.key || null;
          
          console.log('🔥 Firebase push result:', newRef);
          console.log('🔥 Generated key:', newKey);
          
          // Verify the data was actually saved
          setTimeout(async () => {
            try {
              const { get } = db;
              const savedRef = ref(database, `checkins/${newKey}`);
              const snapshot = await get(savedRef);
              if (snapshot.exists()) {
                console.log('✅ Data verified in Firebase:', snapshot.val());
              } else {
                console.error('❌ Data NOT found in Firebase after save!');
              }
            } catch (verifyError) {
              console.error('❌ Error verifying save:', verifyError);
            }
          }, 1000);
    
          // keep modal showing success UX, but clear capturedPhoto so next time fresh
          setShowCamera(false);
          setCapturedPhoto(null);
          setCheckInType(null);
    
          // Display toast based on check-in type
          if (checkInType === 'in') {
            addToast({
              type: 'success',
              message: (
                <div className="flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  <div>
                    <div className="font-bold">Check-in Successful!</div>
                    <div>Wish you a productive and energetic working day, No sale, No Money</div>
                  </div>
                </div>
              ),
              duration: 5000
            });
          } else if (checkInType === 'out') {
            addToast({
              type: 'success',
              message: (
                <div className="flex items-center">
                  <Award className="mr-2" size={20} />
                  <div>
                    <div className="font-bold">Check-out Successful!</div>
                    <div>Congratulations on having a productive day at work, keep trying to receive lots of $$$$ at the end of the month</div>
                  </div>
                </div>
              ),
              duration: 5000
            });
          }
    
          setStatus({ type: 'success', message: '✅ Operation completed successfully!' });
          setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    
          // Upload to Vercel Blob in background and update record with photoURL
          uploadToVercelBlobInBackground(capturedPhoto, employee.id, Date.now(), newKey);
        } catch (error) {
          console.error('Save error:', error);
          setStatus({ type: 'error', message: '❌ Error saving data: ' + (error?.message || error) });
        } finally {
          setLoading(false);
        }
      };
  // Helper to convert dataURL to Blob (temporarily unused)
  const _dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Background upload to Vercel Blob and update DB entry's photoURL
  const uploadToVercelBlobInBackground = async (photoData, employeeId, timestampMs, recordKey) => {
    if (!db || !recordKey) return;
    try {
      // Temporarily disabled due to process.env issues in Vite
      console.log('📸 Photo upload temporarily disabled - using base64 storage');
      console.log('Record key:', recordKey);
      console.log('Employee:', employeeId);
      
      // TODO: Re-enable when Vercel Blob environment is properly configured
      // const photoFileName = `checkin-photos/${employeeId}_${timestampMs}.jpg`;
      // const blob = dataURLtoBlob(photoData);
      // const { url } = await put(photoFileName, blob, {
      //   access: 'public',
      //   addRandomSuffix: true,
      // });
      
      // For now, just log success without actual upload
      console.log('✅ Photo data saved to Firebase with base64');
    } catch (error) {
      console.error('Background upload error:', error);
    }
  };

  const _clearHistory = async () => {
    if (!firebaseConfigured) {
      setStatus({ type: 'error', message: '⚠️ Firebase not configured!' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete all check-in history?')) return;

    try {
      const { database, ref, remove } = db;
      const checkinsRef = ref(database, 'checkins');
      await remove(checkinsRef);
      setStatus({ type: 'success', message: '✅ History deleted!' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: '❌ Error deleting data: ' + error.message });
    }
  };

  // Format helpers
  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const _formatTimestamp = (ts) => {
    const date = new Date(ts);
return date.toLocaleString('en-US');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pb-28">
        {/* Header with Time */}
        <div className="relative backdrop-blur-xl bg-white/10 border-b border-white/20 px-6 py-8">
          <div className="text-center text-white">
            <div className="text-6xl font-bold mb-2 drop-shadow-lg tracking-tight">{formatTime(currentTime)}</div>
            <div className="text-sm opacity-90 font-medium">{formatDate(currentTime)}</div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Employee Info - Compact */}
          <div className="relative backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl shadow-xl overflow-hidden p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <User size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide">Employee</div>
                <div className="font-bold text-xl text-gray-800">{employee.name || 'Not logged in'}</div>
                <div className="text-sm text-gray-600 font-medium">ID: {employee.id || '-'}</div>
              </div>
            </div>
          </div>

          {/* Status Grid - WiFi & Location */}
          <div className="grid grid-cols-1 gap-4">
            {/* WiFi Status */}
            <div className={`relative backdrop-blur-xl border-2 rounded-3xl shadow-xl overflow-hidden p-5 ${
              wifiInfo.verified 
                ? 'bg-green-400/20 border-green-400/50' 
                : 'bg-orange-400/20 border-orange-400/50'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      wifiInfo.verified ? 'bg-green-500' : 'bg-orange-500'
                    }`}>
                      <Wifi className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-0.5">Network</div>
                      <div className="font-bold text-lg text-gray-800">{wifiInfo.ssid}</div>
                    </div>
                  </div>
                  <button
                    onClick={detectWifiAndIP}
                    className="w-10 h-10 rounded-xl bg-white/70 hover:bg-white flex items-center justify-center text-lg transition shadow-md"
                  >
                    🔄
                  </button>
                </div>
                
                {wifiInfo.verified ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-xl">
                    <CheckCircle size={18} className="text-green-700" />
                    <span className="text-sm text-green-700 font-semibold">Verified Network</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-xl">
                    <AlertCircle size={18} className="text-orange-700" />
                    <span className="text-sm text-orange-700 font-semibold">Connect to company WiFi</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="relative backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl shadow-xl overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30 pointer-events-none" />
              <div className="relative flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <MapPin size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Location</div>
                  <div className="text-sm text-gray-700 font-medium line-clamp-2">{location.address || 'Fetching location...'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          {status.message && (
            <div className={`relative backdrop-blur-xl border rounded-2xl shadow-lg overflow-hidden p-4 ${
              status.type === 'success' ? 'bg-green-400/20 border-green-300/40' : 
              status.type === 'info' ? 'bg-blue-400/20 border-blue-300/40' : 
              'bg-red-400/20 border-red-300/40'
            }`}>
              <div className="relative flex items-center gap-2">
                {status.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <div className="whitespace-pre-line text-sm">{status.message}</div>
              </div>
            </div>
          )}

          {/* Check-in Buttons - Large & Bold */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => handleCheckin('in')}
              disabled={
                loading ||
                !firebaseConfigured ||
                !wifiInfo.verified ||
                !employee.id ||
                !employeesMap[employee.id] ||
                employeesMap[employee.id]?.active === false
              }
              className="relative backdrop-blur-xl bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white/40 rounded-3xl shadow-2xl overflow-hidden py-8 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <div className="relative flex flex-col items-center gap-3 text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <LogIn size={36} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-xl">Check In</span>
              </div>
            </button>

            <button
              onClick={() => handleCheckin('out')}
              disabled={
                loading ||
                !firebaseConfigured ||
                !wifiInfo.verified ||
                !employee.id ||
                !employeesMap[employee.id] ||
                employeesMap[employee.id]?.active === false
              }
              className="relative backdrop-blur-xl bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white/40 rounded-3xl shadow-2xl overflow-hidden py-8 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <div className="relative flex flex-col items-center gap-3 text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <LogOut size={36} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-xl">Check Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Camera Modal - Liquid Glass */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="relative backdrop-blur-2xl bg-white/95 border border-white/40 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none" />
                
                <div className="relative">
                  <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Camera size={24} className="text-blue-600" />
                      Take Photo
                    </h2>
                    <button 
                      onClick={cancelCamera} 
                      className="p-2 rounded-full hover:bg-gray-200/50 transition"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-5">
                    {!capturedPhoto ? (
                      <div className="space-y-4">
                        <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[3/4]">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-64 border-4 border-white/50 rounded-full"></div>
                          </div>
                        </div>

                        <p className="text-center text-gray-600 text-sm">📸 Position your face in the circle</p>

                        <button 
                          onClick={capturePhoto} 
                          className="w-full relative backdrop-blur-xl bg-gradient-to-br from-blue-500 to-purple-600 border border-white/30 rounded-2xl shadow-xl p-4 text-white font-bold active:scale-95 transition-transform"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-2xl" />
                          <div className="relative flex items-center justify-center gap-2">
                            <Camera size={20} />
                            <span>Capture</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden">
                          <img src={capturedPhoto} alt="Captured" className="w-full h-auto" />
                        </div>

                        <p className="text-center text-green-600 text-sm font-medium">✅ Photo captured successfully</p>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={retakePhoto} 
                            className="relative backdrop-blur-xl bg-gray-400/80 border border-white/30 rounded-2xl shadow-lg p-3 text-white font-bold active:scale-95 transition-transform"
                          >
                            Retake
                          </button>
                          <button 
                            onClick={confirmCheckin} 
                            disabled={loading}
                            className="relative backdrop-blur-xl bg-gradient-to-br from-green-500 to-emerald-600 border border-white/30 rounded-2xl shadow-lg p-3 text-white font-bold disabled:opacity-50 active:scale-95 transition-transform"
                          >
                            {loading ? 'Saving...' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <BottomNav />
    </>
  );
}