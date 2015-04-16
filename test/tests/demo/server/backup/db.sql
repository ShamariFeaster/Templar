-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 13, 2015 at 02:03 AM
-- Server version: 5.6.12-log
-- PHP Version: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

DROP TABLE IF EXISTS `ads`;
CREATE TABLE IF NOT EXISTS `ads` (
  `uid` int(10) unsigned NOT NULL COMMENT 'FK of ''user'' table',
  `ad_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `state` varchar(30) NOT NULL,
  `city` varchar(30) NOT NULL,
  `price` mediumint(9) DEFAULT NULL,
  `title` tinytext NOT NULL,
  `description` text NOT NULL,
  `ad_type` varchar(75) NOT NULL,
  `ad_category` varchar(75) NOT NULL,
  `ad_state` enum('draft','active','deactivated') NOT NULL DEFAULT 'draft',
  `start` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end` datetime DEFAULT NULL,
  `phone_num` tinytext,
  `contact_methods` set('Call/Text','Email','Private Message') DEFAULT NULL,
  PRIMARY KEY (`ad_id`),
  KEY `uid` (`uid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=77 ;

--
-- Dumping data for table `ads`
--

INSERT INTO `ads` (`uid`, `ad_id`, `state`, `city`, `price`, `title`, `description`, `ad_type`, `ad_category`, `ad_state`, `start`, `end`, `phone_num`, `contact_methods`) VALUES
(18, 75, 'GEORGIA', 'Atlanta', 5500, '1997 BMW Z3', 'The BMW Z3 was the first modern mass-market roadster produced by BMW, as well as the first new BMW model assembled in the United States.The Z in Z3 originally stood for Zukunft (German for future). The Z3 was introduced via video press release by BMW Nort', 'For Sale', 'Autos', 'draft', '2015-04-13 01:38:10', '2015-07-12 21:38:10', NULL, NULL),
(18, 76, 'GEORGIA', 'Atlanta', 5500, 'Room for rent', 'awesome room', 'Housing', 'Rooms', 'draft', '2015-04-13 01:39:15', '2015-07-12 21:39:15', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ad_pics`
--

DROP TABLE IF EXISTS `ad_pics`;
CREATE TABLE IF NOT EXISTS `ad_pics` (
  `ad_pic_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ad_id` int(10) unsigned DEFAULT NULL,
  `image_uri` tinytext NOT NULL,
  PRIMARY KEY (`ad_pic_id`),
  KEY `ad_id` (`ad_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=144 ;

--
-- Dumping data for table `ad_pics`
--

INSERT INTO `ad_pics` (`ad_pic_id`, `ad_id`, `image_uri`) VALUES
(137, NULL, '459cad899905f977fb6bf66e59038bc4'),
(138, NULL, '459cad899905f977fb6bf66e59038bc4'),
(139, NULL, '459cad899905f977fb6bf66e59038bc4'),
(140, NULL, 'e38ce5bf3e2e9ddb03d6ec6953ef63a5'),
(143, 76, '72ed2609f257e76e8e2cb525718d0531');

-- --------------------------------------------------------

--
-- Table structure for table `credentials`
--

DROP TABLE IF EXISTS `credentials`;
CREATE TABLE IF NOT EXISTS `credentials` (
  `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `un` varchar(20) NOT NULL,
  `pw` tinytext NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `un` (`un`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='This table holds the credentials for all users of the system' AUTO_INCREMENT=34 ;

--
-- Dumping data for table `credentials`
--

INSERT INTO `credentials` (`uid`, `un`, `pw`) VALUES
(18, 'alistproducer1', '$2y$10$lCBZToMddHrM4FmKQP6aH.eka/Vtl5nXWoD8GPYZTS9.62Ez3d3/q'),
(31, 'alistproducer2', '$2y$10$lCBZToMddHrM4FmKQP6aH.eka/Vtl5nXWoD8GPYZTS9.62Ez3d3/q');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `uid` int(10) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `role` enum('guest','basic','premium','admin') NOT NULL DEFAULT 'guest',
  `email` varchar(50) NOT NULL,
  `profile_pic_uri` tinytext,
  `pp_mime` tinytext,
  `sex` set('m','f','na') NOT NULL DEFAULT 'na',
  `fn` tinytext NOT NULL,
  `ln` tinytext NOT NULL,
  `age` tinyint(3) unsigned NOT NULL,
  `state` tinytext NOT NULL,
  `city` tinytext NOT NULL,
  `description` text NOT NULL,
  `phone_num` tinytext NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`uid`, `created`, `active`, `role`, `email`, `profile_pic_uri`, `pp_mime`, `sex`, `fn`, `ln`, `age`, `state`, `city`, `description`, `phone_num`) VALUES
(18, '2015-03-15 17:28:31', 1, 'guest', 'a@b.com', 'c121883e228f0f367e53d8c48de283e0', 'image/jpeg', 'na', 'Shamari ', 'Feaster III', 31, 'GEORGIA', 'Atlanta', 'JavaScript Ninja!', '7702124627'),
(31, '2015-03-22 07:12:26', 1, 'guest', 'a@b.com', '26681dc3139de95f7a60ad1e4b893e76', 'image/jpeg', 'm', 'Fdhdfh', 'fdhdfhfd', 18, 'ALABAMA', 'Birmingham', 'fdhfdhdfh', '0');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ads`
--
ALTER TABLE `ads`
  ADD CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `credentials` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ad_pics`
--
ALTER TABLE `ad_pics`
  ADD CONSTRAINT `ad_pics_ibfk_1` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`ad_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `credentials` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
