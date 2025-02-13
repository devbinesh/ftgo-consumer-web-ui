import { FaSync as FaRefresh } from 'react-icons/fa';
import { FaHamburger, FaMapMarkerAlt, FaClock, FaSearch, FaEdit, FaPlus, FaMinus, FaCartPlus } from 'react-icons/fa';
import React from 'react';
import theme from './icons.module.scss'

export const IconRefresh = () => <FaRefresh className={ theme['icon-spin']} />;
export const IconLogo = FaHamburger;
export const IconGeo = FaMapMarkerAlt;
export const IconClock = FaClock;
export const IconSearch = FaSearch;
export const IconEdit = FaEdit;
export const IconPlus = FaPlus;
export const IconCartPlus = FaCartPlus;
export const IconMinus = FaMinus;
