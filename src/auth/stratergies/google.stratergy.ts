import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";



@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(
        @Inject(googleOauthConfig.KEY) 
        private googleConfiguration: ConfigType<typeof googleOauthConfig>,
        private authService: AuthService
    ){
        super({
            clientID:googleConfiguration.clientID,
            clientSecret: googleConfiguration.clientSecret,
            callbackURL: googleConfiguration.callbackURL,
            scope:["email", 'profile']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const googleUsername = profile.displayName || profile.id; // Use Google profile's display name or ID as username
        
        // Check if user exists based on Google profile
        let user = await this.authService.findUserByUsername(googleUsername);
      
        // If user doesn't exist, create a new one
        if (!user) {
          user = await this.authService.createUser({
            username: googleUsername,
            password: 'OAuth_Generated_Password', // You can store a random password or skip password validation for OAuth users
            stats: {
              gamesPlayed: 0,
              wins: 0,
              loses: 0,
              draw: 0,
              wordsGuessed: 0,
              wellDescribed: 0,
            },
          });
        }
      
        // Complete validation and return user
        done(null, user);
      }
      
}