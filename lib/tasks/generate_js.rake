desc "Use Stitch to create static javascript file for production use"
task :generate_js do
  js = Stitch::Package.new(:paths => ["app/assets/javascripts/app", "app/assets/javascripts/lib"]).compile
  File.open("public/javascripts/bundle/application.js", 'w') {|f| f.write(js) }
end



