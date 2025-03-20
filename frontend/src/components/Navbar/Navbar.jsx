import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import { useAuth0 } from '@auth0/auth0-react';
import {NavLink} from "react-router-dom"

const drawerWidth = 240;
const navItems = ['Home', 'Store', 'Contact'];

function DrawerAppBar(props) {
  const { window: propWindow } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Handle dropdown open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle dropdown close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Send user data to backend after authentication
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const storeUser = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/users/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              auth0Id: user?.sub,
              email: user?.email,
              name: user?.name,
              picture: user?.picture,
            }),
          });

          if (!response.ok) {
            console.error('Failed to create user:', await response.json());
          } else {
            console.log('User created successfully');
          }
        } catch (error) {
          console.error('Failed to create user:', error);
        }
      };

      storeUser();
    }
  }, [isAuthenticated, user]); // Trigger only when authentication state changes

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Jungle Safari
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = propWindow !== undefined ? () => propWindow().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        component="nav"
        sx={{
          background: scrolled ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '0.05rem',
            }}
          >
            Jungle Safari
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
             <NavLink to={item==='Home'?'/':`${item}`}><Button key={item} sx={{ color: '#fff', textTransform: 'none' }}>
                {item}
              </Button></NavLink> 
            ))}

            {!isAuthenticated ? (
              <Button
                onClick={() => loginWithRedirect()}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  borderRadius: '24px',
                  padding: '8px 20px',
                  ml: 2,
                }}
              >
                Login
              </Button>
            ) : (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <Avatar src={user?.picture} alt="User" />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                  <MenuItem
                    onClick={() => logout({ returnTo: window.location.origin })}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}

DrawerAppBar.propTypes = {
  window: PropTypes.func,
};

export default DrawerAppBar;
