# This file is used by Rack-based servers to start the application.
require 'sass/plugin/rack'
use Sass::Plugin::Rack
Sass::Plugin.options[:never_update] = true
	

require ::File.expand_path('../config/environment',  __FILE__)
run PedidosV3::Application
