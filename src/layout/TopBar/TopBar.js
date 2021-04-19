import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  makeStyles,
  AppBar,
  Toolbar,
  IconButton,
  Menu as MenuIcon,
  Hidden,
} from '@material-ui/core';
import {
  AccountCircle,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@material-ui/icons';
import { environment } from '@environments/environment';
import logo from '@assets/tp-logo.png';
import {
  logout,
  getUser,
  GET_USER_OPTIONS_SUCCESS,
  GET_USER_OPTIONS_FAILURE,
  GET_ORGANIZATION_OPTIONS_SUCCESS,
  GET_ORGANIZATION_OPTIONS_FAILURE,
} from '@redux/authuser/actions/authuser.actions';
import AccountMenu from './AccountMenu';
import AdminMenu from './AdminMenu';
import { routes } from '@routes/routesConstants';
import { httpService } from '@modules/http/http.service';
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#383636',
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  logo: {
    maxWidth: 250,
  },
  menuRight: {
    marginLeft: 'auto',
  },
  paper: {
    border: '1px solid',
  },
}));

/**
 * Component for the top bar header.
 */
const TopBar = ({
  navHidden,
  setNavHidden,
  history,
  dispatch,
  data,
  organizationData,
  userOptions,
  orgOptions,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [settingEl, setSettingEl] = React.useState(null);

  let user;
  let isAdmin = false;

  if (data && data.data) {
    user = data.data;
    isAdmin = checkForAdmin(user) || checkForGlobalAdmin(user);
  }

  useEffect(() => {
    dispatch(getUser());
    if (userOptions === null) {
      httpService
        .makeOptionsRequest("options", `${environment.API_URL}coreuser/`, true)
        .then((response) => response.json())
        .then((res) => {
          dispatch({ type: GET_USER_OPTIONS_SUCCESS, data: res });
        })
        .catch((err) => {
          dispatch({ type: GET_USER_OPTIONS_FAILURE, error: err });
        });
    }

    if (orgOptions === null) {
      httpService
        .makeOptionsRequest(
          "options",
          `${environment.API_URL}organization/`,
          true
        )
        .then((response) => response.json())
        .then((res) => {
          dispatch({ type: GET_ORGANIZATION_OPTIONS_SUCCESS, data: res });
        })
        .catch((err) => {
          dispatch({ type: GET_ORGANIZATION_OPTIONS_FAILURE, error: err });
        });
    }
  }, []);

  const settingMenu = (event) => {
    setSettingEl(event.currentTarget);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const refreshPage = () => {
    window.location.reload();
  }

  const handleLogoutClick = () => {
    dispatch(logout());
    history.push('/');
  };

  const handleMyAccountClick = () => {
    history.push(routes.MY_ACCOUNT);
    setAnchorEl(null);
  };

  const handleAdminPanelClick = () => {
    history.push(routes.ADMIN_PANEL);
    setSettingEl(null);
  };

  const handleUserManagementClick = () => {
    history.push(routes.USER_MANAGEMENT);
    setSettingEl(null);
  };

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <Hidden mdUp>
          <IconButton
            edge="start"
            className={classes.menuButton}
            onClick={() => setNavHidden(!navHidden)}
            color="default"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <img src={logo} className={classes.logo} alt="Company text logo" />

        <div className={classes.menuRight}>
          {isAdmin && 
          <IconButton
            aria-label="admin section"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={settingMenu}
            color="default"
          >
            <SettingsIcon fontSize="large" />
          </IconButton>}
          <AdminMenu
            settingEl={settingEl}
            setSettingEl={setSettingEl}
            handleAdminPanelClick={handleAdminPanelClick}
            handleUserManagementClick={handleUserManagementClick}
          />
          <IconButton
            aria-label="refresh-app"
            aria-controls="menu-appbar"
            aria-haspopup="false"
            onClick={refreshPage}
            color="default"
          >
            <RefreshIcon fontSize="large" />
          </IconButton>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="default"
          >
            <AccountCircle fontSize="large" />
          </IconButton>
          <AccountMenu
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            user={user}
            organizationData={organizationData}
            handleLogoutClick={handleLogoutClick}
            handleMyAccountClick={handleMyAccountClick}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.authReducer,
});

export default connect(mapStateToProps)(TopBar);
