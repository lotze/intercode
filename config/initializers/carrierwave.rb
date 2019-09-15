CarrierWave.configure do |config|
  if Concerns::EnvironmentBasedUploader.use_fog?
    config.fog_provider = 'fog/aws'
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
      region: ENV['AWS_S3_REGION'] || 'us-east-1'
    }

    config.fog_directory = ENV['AWS_S3_BUCKET']
    config.asset_host = ENV['UPLOADS_HOST'] if ENV['UPLOADS_HOST'].present?
  end
end
