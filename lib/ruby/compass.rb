# SASS

Sass::Script::Number.precision = 16

# Compass callbacks

def logger
  @logger ||= ::Compass::Logger.new
end

on_stylesheet_saved do |filename|
  raw_filename = File.basename(filename, File.extname(filename))

  new_filename = 'bootstrap'

  if raw_filename != 'bootstrap'
    new_filename << "-#{raw_filename}"
  end

  new_filename << '-@VERSION@.@EXTENSION@'

  logger.record(:warning, "#{Compass.configuration.css_dir}/#{File.basename(filename)} renamed to #{new_filename}")

  File.rename(filename, new_filename)
end