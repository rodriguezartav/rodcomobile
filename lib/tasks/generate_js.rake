desc "Use Stitch to create static javascript file for production use"
task :generate_js do
  p1 = Rails.root + "app/assets/javascripts/app"
  p2 = Rails.root + "app/assets/javascripts/lib"
  
  package = Stitch::Package.new(:paths => [p2, p1])
  js = package.compile
  puts js.index("Quote")
  File.open("public/javascripts/bundle/application.js", 'w') {|f| f.write(js) }
end



