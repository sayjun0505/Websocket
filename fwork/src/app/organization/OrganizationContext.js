import * as React from 'react';
import { useEffect, useState,useContext  } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import {
  clearOrganization,
  getOrganizationState,getOrganizationStateforSocket,
  setOrganization,
} from 'app/store/organizationSlice';
import { clearPermission, getPermission } from 'app/store/permissionSlice';
import history from '@history';
import { selectUserRole, setRole } from 'app/store/userSlice';
import { useAuth } from '../auth/AuthContext';
import { getNavigationUsers,getNavigationUsersforSocket } from '../main/apps/teamChat/store/directMessageUsersSlice';
import { getChats } from '../main/apps/chat/store/chatsSlice';
import {SocketContext} from '../context/socket';
const OrganizationContext = React.createContext();

const OrganizationProvider = ({ children }) => {
  const location = useLocation();
  const [isOrganizationSelected, setIsOrganizationSelected] = useState(undefined);
  const [waitOrganizationCheck, setWaitOrganizationCheck] = useState(true);
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const user = useSelector(state=>{return state.user});
  const auth = useAuth();
  const socket = useContext(SocketContext);

  useEffect(()=>{
    socket.on("getChats response", res=>{
      // console.log("getChats arrived:",res)
    });    
    socket.on("getOrganizationState response", res=>{
      // console.log("getOrganizationState arrived:",res)
      console.error("+++++++++")
      dispatch(getOrganizationStateforSocket(res));
    }); 
    socket.on("getNavigationUsers response", res=>{
      dispatch(getNavigationUsersforSocket(res));
    });
    socket.on("getPermission response", res=>{
      if(res!=""){
        // console.error("getPermission arrived:",res)
      }
      else{
        dispatch(showMessage({ message: 'Get Permission error', variant: 'error' }));
      }
      
    });    
  },[socket])
  useEffect(() => {
    const organization = window.localStorage.getItem('organization');

    if (auth.isAuthenticated && organization) {
      dispatch(setRole(JSON.parse(organization).role));
      setIsOrganizationSelected(true);
      dispatch(setOrganization(JSON.parse(organization)));
      // console.error("1")
      // dispatch(getPermission(JSON.parse(organization).role));
      socket.emit("getPermission",JSON.parse(organization).role)
      console.error("xxx")
      
      socket.emit("getOrganizationState",{oid:JSON.parse(organization).organizationId,uid:user.uuid})
      // dispatch(getOrganizationState(JSON.parse(organization).organizationId));
      socket.emit("getNavigationUsers",{oid:JSON.parse(organization).organizationId,uid:user.uuid})
      // dispatch(getNavigationUsers(JSON.parse(organization).organizationId));
      // dispatch(getChats(JSON.parse(organization).organizationId));
    } else {
      setIsOrganizationSelected(false);
      dispatch(clearOrganization());
      dispatch(clearPermission());
      if (auth.isAuthenticated) {
        // console.log('pathname ', window.location.pathname);
        const path = window.location.pathname.split('/');
        // console.log('pathname ', path);
        if (!(path && path.length > 2 && path[1] === 'packages')) {
          history.push('/organizations');
        }

        //   setWaitAuthCheck(false);
        //   setIsAuthenticated(false);
      }
    }
    setWaitOrganizationCheck(false);
  }, [auth.isAuthenticated, dispatch]);

  useEffect(() => {
    if (userRole) {
      const organization = window.localStorage.getItem('organization');
      if (organization) {
        const currentRole = JSON.parse(organization).role;
        if (currentRole && currentRole !== userRole) {
          dispatch(setRole(currentRole));
        }
      }
    }
  }, [dispatch, userRole]);

  const setSelectOrganization = (organization) => {
    if (organization) {
      // console.info('☣️ [Organization] ✔️ Set Organization.');
      dispatch(setRole(organization.role));
      localStorage.setItem('organization', JSON.stringify(organization));
      dispatch(setOrganization(organization));  
      // console.error("2",organization.role)    
      dispatch(getPermission(organization.role));
      console.error("vvv")
      
      dispatch(getOrganizationState(organization.organizationId));
      dispatch(getNavigationUsers(organization.organizationId));
      // dispatch(getChats(organization.organizationId));
    } else {
      // console.info('☣️ [Organization] ❌ Clear Organization.');
      localStorage.removeItem('organization');
      dispatch(clearOrganization());
      dispatch(clearPermission());
    }
  };

  const updateRole = (role) => {
    if (role) {
      const organizationLocalStorage = window.localStorage.getItem('organization');
      if (organizationLocalStorage) {
        const organization = JSON.parse(organizationLocalStorage);
        dispatch(setRole(role));
        localStorage.setItem('organization', JSON.stringify({ ...organization, role }));
        dispatch(setOrganization(organization));
        // console.error("3",organization.role)
        dispatch(getPermission(organization.role));
      }
    }
  };

  return waitOrganizationCheck ? (
    <FuseSplashScreen />
  ) : (
    <OrganizationContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        isOrganizationSelected,
        setSelectOrganization,
        updateRole,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

function useOrganization() {
  const context = React.useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within a OrganizationProvider');
  }
  return context;
}

export { OrganizationProvider, useOrganization };
